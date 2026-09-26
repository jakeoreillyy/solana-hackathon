import { fetchAssetV1, mplCore, transfer } from "@metaplex-foundation/mpl-core"
import { createNoopSigner, publicKey } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters"
import { ownership } from "@proven/ownership"
import { explorerTx, type Item, type PurchaseResult } from "@proven/shared"
import {
  Connection,
  Keypair,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"

const DEFAULT_RPC_URL = "https://api.devnet.solana.com"

export class SettlementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SettlementError"
  }
}

export type PurchaseTerms = {
  priceLamports: bigint
  buyer: PublicKey
  seller: PublicKey
  asset: PublicKey
}

export const assertCanSettle = (item: Item, buyerWallet: string): PurchaseTerms => {
  if (item.status !== "AVAILABLE") {
    throw new SettlementError(`Item is ${item.status}, cannot buy`)
  }

  const buyer = parseAddress("Buyer", buyerWallet)
  const seller = parseAddress("Seller", item.sellerWallet)
  const owner = parseAddress("Owner", item.ownerWallet)
  const asset = parseAddress("Asset", item.assetAddress)

  if (buyer.equals(seller)) {
    throw new SettlementError("Buyer and seller must be different wallets")
  }
  if (!owner.equals(seller)) {
    throw new SettlementError("Item owner does not match the seller")
  }

  return {
    priceLamports: parsePrice(item.priceLamports),
    buyer,
    seller,
    asset,
  }
}

export const settlePurchase = async (input: {
  connection: Connection
  item: Item
  buyer: Keypair
  seller: Keypair
}): Promise<PurchaseResult> => {
  assertCanSettle(input.item, input.buyer.publicKey.toBase58())
  assertKeypair("Seller", input.seller, input.item.sellerWallet)

  const tx = await buildAtomicPurchaseTransaction(
    input.connection,
    input.item,
    input.buyer.publicKey,
  )
  tx.sign(input.buyer, input.seller)
  return submit(input.connection, tx, input.buyer.publicKey.toBase58())
}

export const buy = async (itemId: string, buyerWallet: string): Promise<PurchaseResult> => {
  await loadEnvFile()
  const item = await ownership.getItem(itemId)
  const seller = await loadKeypair(requiredEnv("SELLER_KEYPAIR_PATH"))
  const buyer = await loadKeypair(requiredEnv("BUYER_KEYPAIR_PATH"))
  assertKeypair("Seller", seller, item.sellerWallet)
  assertKeypair("Buyer", buyer, buyerWallet)
  return settlePurchase({
    connection: connectionFromEnv(),
    item,
    buyer,
    seller,
  })
}

export const buildPurchaseTransaction = async (
  itemId: string,
  buyerWallet: string,
): Promise<Uint8Array> => {
  await loadEnvFile()
  const item = await ownership.getItem(itemId)
  const seller = await loadKeypair(requiredEnv("SELLER_KEYPAIR_PATH"))
  assertKeypair("Seller", seller, item.sellerWallet)

  const tx = await buildAtomicPurchaseTransaction(
    connectionFromEnv(),
    item,
    parseAddress("Buyer", buyerWallet),
  )
  tx.partialSign(seller)
  return Uint8Array.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false }))
}

export const executePurchase = async (signedTx: Uint8Array): Promise<PurchaseResult> => {
  let tx: Transaction
  try {
    tx = Transaction.from(Buffer.from(signedTx))
  } catch (error) {
    throw new SettlementError(
      `Signed transaction could not be decoded: ${errorMessage(error)}`,
    )
  }
  if (!tx.feePayer) {
    throw new SettlementError("Transaction is missing the buyer fee payer")
  }
  if (tx.signatures.some((entry) => entry.signature === null)) {
    throw new SettlementError("Transaction is missing a signature")
  }
  await loadEnvFile()
  return submit(connectionFromEnv(), tx, tx.feePayer.toBase58())
}

export const buildAtomicPurchaseTransaction = async (
  connection: Connection,
  item: Item,
  buyer: PublicKey,
): Promise<Transaction> => {
  const terms = assertCanSettle(item, buyer.toBase58())
  const umi = createUmi(connection.rpcEndpoint).use(mplCore())
  const assetPk = publicKey(terms.asset.toBase58())

  let asset: Awaited<ReturnType<typeof fetchAssetV1>>
  try {
    asset = await fetchAssetV1(umi, assetPk, { commitment: "confirmed" })
  } catch (error) {
    throw new SettlementError(
      `Could not load Core asset ${terms.asset.toBase58()}: ${errorMessage(error)}`,
    )
  }

  if (String(asset.owner) !== terms.seller.toBase58()) {
    throw new SettlementError(
      `On-chain owner is ${String(asset.owner)}, expected seller ${terms.seller.toBase58()}`,
    )
  }

  const coreTransfer = transfer(umi, {
    asset,
    newOwner: publicKey(terms.buyer.toBase58()),
    authority: createNoopSigner(publicKey(terms.seller.toBase58())),
    payer: createNoopSigner(publicKey(terms.buyer.toBase58())),
  })

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")
  const tx = new Transaction({
    feePayer: terms.buyer,
    blockhash,
    lastValidBlockHeight,
  })
  tx.add(
    SystemProgram.transfer({
      fromPubkey: terms.buyer,
      toPubkey: terms.seller,
      lamports: Number(terms.priceLamports),
    }),
    ...coreTransfer.getInstructions().map((instruction) => toWeb3JsInstruction(instruction)),
  )
  return tx
}

const submit = async (
  connection: Connection,
  tx: Transaction,
  newOwner: string,
): Promise<PurchaseResult> => {
  try {
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    })
    if (!tx.recentBlockhash || tx.lastValidBlockHeight == null) {
      throw new SettlementError("Transaction is missing blockhash expiry")
    }
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash: tx.recentBlockhash,
        lastValidBlockHeight: tx.lastValidBlockHeight,
      },
      "confirmed",
    )
    if (confirmation.value.err) {
      throw new SettlementError(
        `Purchase failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
      )
    }
    return {
      signature,
      newOwner,
      explorerUrl: explorerTx(signature),
    }
  } catch (error) {
    if (error instanceof SettlementError) {
      throw error
    }
    if (error instanceof SendTransactionError) {
      const logs = error.logs?.join("\n") ?? ""
      throw new SettlementError(`Purchase failed: ${error.message}${logs ? `\n${logs}` : ""}`)
    }
    throw new SettlementError(`Purchase failed: ${errorMessage(error)}`)
  }
}

const assertKeypair = (label: string, keypair: Keypair, expected: string) => {
  if (keypair.publicKey.toBase58() !== expected) {
    throw new SettlementError(`${label} keypair does not match ${expected}`)
  }
}

const parseAddress = (label: string, value: string): PublicKey => {
  try {
    return new PublicKey(value)
  } catch {
    throw new SettlementError(`${label} is not a valid Solana address`)
  }
}

const parsePrice = (value: string): bigint => {
  if (!/^\d+$/.test(value)) {
    throw new SettlementError("Price must be a positive number of lamports")
  }
  const price = BigInt(value)
  if (price <= 0n) {
    throw new SettlementError("Price must be a positive number of lamports")
  }
  if (price > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new SettlementError("Price in lamports is too large to transfer")
  }
  return price
}

export const connectionFromEnv = (): Connection => new Connection(rpcUrl(), "confirmed")

const rpcUrl = (): string =>
  process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_RPC_URL

const requiredEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new SettlementError(`Set ${name}`)
  }
  return value
}

let envLoaded = false

const loadEnvFile = async () => {
  if (envLoaded || typeof window !== "undefined") {
    envLoaded = true
    return
  }
  envLoaded = true
  const { existsSync, readFileSync } = await import(/* webpackIgnore: true */ "node:fs")
  const { resolve } = await import(/* webpackIgnore: true */ "node:path")
  const path = resolve(process.cwd(), ".env")
  if (!existsSync(path)) {
    return
  }
  const lines = readFileSync(path, "utf8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }
    const eq = trimmed.indexOf("=")
    if (eq === -1) {
      continue
    }
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

export const loadKeypair = async (path: string): Promise<Keypair> => {
  if (typeof window !== "undefined") {
    throw new SettlementError("Demo keypairs can only be loaded in Node")
  }
  const { readFileSync } = await import(/* webpackIgnore: true */ "node:fs")
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as number[]
    return Keypair.fromSecretKey(Uint8Array.from(parsed))
  } catch (error) {
    throw new SettlementError(`Could not read keypair at ${path}: ${errorMessage(error)}`)
  }
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)
