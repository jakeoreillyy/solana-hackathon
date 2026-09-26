import type { Item, ProvenanceEntry, PurchaseResult, SettlementApi } from "@proven/shared"
import { explorerTx } from "@proven/shared"
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"

/**
 * Atomic settlement: one transaction that pays the seller in SOL AND moves the item token
 * from seller to buyer. Because it is a single transaction, either both happen or neither
 * does — the buyer can never pay without receiving the item, and vice versa.
 *
 * The item is a 0-decimals, supply-1 SPL token (minted by @proven/ownership); whoever holds
 * it owns the item. The atomic swap needs both signatures (buyer authorizes payment, seller
 * authorizes the token transfer), which is why it runs on one device with both demo keypairs
 * on disk rather than through a browser wallet.
 *
 * Item metadata (incl. price and provenance history) lives in apps/web/public/items.json,
 * the same store @proven/ownership writes. On-chain balances remain the source of truth.
 */

const rpcUrl = () =>
  process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
let _conn: Connection | undefined
const connection = () => (_conn ??= new Connection(rpcUrl(), "confirmed"))
const isServer = () => typeof window === "undefined"

/** Small cushion over the price for transaction fees + rent for the buyer's token account. */
const FEE_CUSHION_LAMPORTS = 5_000_000 // 0.005 SOL

type Stored = Omit<Item, "ownerWallet" | "status" | "sellerVerified">
type Store = Record<string, Stored>

/** Absolute path to items.json, anchored to this module so CWD doesn't matter. */
async function itemsPath(): Promise<string> {
  const { fileURLToPath } = await import("url")
  return fileURLToPath(new URL("../../../apps/web/public/items.json", import.meta.url))
}

async function readStore(): Promise<Store> {
  const { readFileSync } = await import("fs")
  try {
    return JSON.parse(readFileSync(await itemsPath(), "utf8"))
  } catch {
    return {}
  }
}

async function writeStore(store: Store) {
  const { writeFileSync, mkdirSync } = await import("fs")
  const { dirname } = await import("path")
  const p = await itemsPath()
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(store, null, 2) + "\n")
}

async function loadKeypair(path: string) {
  const { readFileSync } = await import("fs")
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))))
}

const demoSeller = () => loadKeypair(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
const demoBuyer = () => loadKeypair(process.env.BUYER_KEYPAIR_PATH ?? ".keys/buyer.json")

/** Public key of the one-device demo buyer, for callers that need it (e.g. the web route). */
export async function demoBuyerWallet(): Promise<string> {
  return (await demoBuyer()).publicKey.toBase58()
}

function parsePubkey(value: string, label: string): PublicKey {
  try {
    return new PublicKey(value)
  } catch {
    throw new Error(`Invalid ${label} public key: "${value}"`)
  }
}

async function storedItem(itemId: string): Promise<Stored> {
  const item = (await readStore())[itemId]
  if (!item) throw new Error(`Unknown item: ${itemId}`)
  return item
}

/** Current on-chain holder of the supply-1 token = current owner of the item. */
async function ownerOf(mint: string): Promise<string> {
  const conn = connection()
  const largest = await conn.getTokenLargestAccounts(new PublicKey(mint))
  const holder = largest.value.find((a) => a.uiAmount === 1)
  if (!holder) throw new Error(`No holder found for asset ${mint}`)
  const info = await conn.getParsedAccountInfo(holder.address)
  const data = info.value?.data
  if (!data || !("parsed" in data)) throw new Error(`Cannot read holder of ${mint}`)
  return data.parsed.info.owner as string
}

/** Build the atomic pay + transfer transaction (fee payer = buyer, partially signed by seller). */
async function buildTx(
  item: Stored,
  buyer: PublicKey,
  seller: Keypair,
): Promise<Transaction> {
  const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountIdempotentInstruction,
    createTransferCheckedInstruction,
  } = await import("@solana/spl-token")

  const mint = new PublicKey(item.assetAddress)
  const price = BigInt(item.priceLamports)
  const sellerAta = await getAssociatedTokenAddress(mint, seller.publicKey)
  const buyerAta = await getAssociatedTokenAddress(mint, buyer)

  const conn = connection()
  const { blockhash } = await conn.getLatestBlockhash()
  const tx = new Transaction({ feePayer: buyer, recentBlockhash: blockhash })
  tx.add(
    // Create the buyer's token account if it doesn't exist yet (buyer pays the rent).
    createAssociatedTokenAccountIdempotentInstruction(buyer, buyerAta, buyer, mint),
    // Payment: buyer -> seller, in one and the same transaction as the transfer.
    SystemProgram.transfer({ fromPubkey: buyer, toPubkey: seller.publicKey, lamports: price }),
    // Ownership: the item token moves seller -> buyer (seller authorizes).
    createTransferCheckedInstruction(sellerAta, mint, buyerAta, seller.publicKey, 1, 0),
  )
  // Seller signs now; the buyer's signature is added by whoever sends it.
  tx.partialSign(seller)
  return tx
}

/** Shared pre-flight for buy(): validate inputs, load signers, confirm the item is for sale. */
async function prepare(itemId: string, buyerWallet: string) {
  if (!isServer()) throw new Error("settlement is server-only — call it from a script or API route")

  const item = await storedItem(itemId)
  const buyer = parsePubkey(buyerWallet, "buyer")

  const seller = await demoSeller()
  if (seller.publicKey.toBase58() !== item.sellerWallet) {
    throw new Error("seller keypair does not match the item's sellerWallet")
  }

  const currentOwner = await ownerOf(item.assetAddress)
  if (currentOwner === buyer.toBase58()) throw new Error(`Item already owned by buyer ${buyerWallet}`)
  if (currentOwner !== item.sellerWallet) throw new Error(`Item already sold (owner ${currentOwner})`)

  return { item, buyer, seller }
}

async function recordSale(itemId: string, item: Stored, newOwner: string, signature: string) {
  const entry: ProvenanceEntry = { owner: newOwner, signature, at: new Date().toISOString() }
  const store = await readStore()
  store[itemId] = { ...item, history: [...item.history, entry] }
  await writeStore(store)
}

export const settlement: SettlementApi = {
  async buy(itemId, buyerWallet): Promise<PurchaseResult> {
    const { item, buyer, seller } = await prepare(itemId, buyerWallet)

    const conn = connection()
    const buyerKp = await demoBuyer()
    if (buyerKp.publicKey.toBase58() !== buyer.toBase58()) {
      throw new Error("one-device demo can only buy as the demo buyer (BUYER_KEYPAIR_PATH)")
    }

    const price = BigInt(item.priceLamports)
    const balance = BigInt(await conn.getBalance(buyer))
    if (balance < price + BigInt(FEE_CUSHION_LAMPORTS)) {
      const sol = (n: bigint) => (Number(n) / LAMPORTS_PER_SOL).toFixed(4)
      throw new Error(`Insufficient SOL: buyer has ${sol(balance)}, needs ~${sol(price)}`)
    }

    const { sendAndConfirmTransaction } = await import("@solana/web3.js")
    const tx = await buildTx(item, buyer, seller)
    const signature = await sendAndConfirmTransaction(conn, tx, [buyerKp, seller], {
      commitment: "confirmed",
    })

    await recordSale(itemId, item, buyer.toBase58(), signature)
    return { signature, newOwner: buyer.toBase58(), explorerUrl: explorerTx(signature) }
  },

  async buildPurchaseTransaction(itemId, buyerWallet): Promise<Uint8Array> {
    const { item, buyer, seller } = await prepare(itemId, buyerWallet)
    const tx = await buildTx(item, buyer, seller)
    // Not all signatures present yet — the buyer still has to sign before executePurchase.
    return tx.serialize({ requireAllSignatures: false, verifySignatures: false })
  },

  async executePurchase(signedTx): Promise<PurchaseResult> {
    if (!isServer()) throw new Error("settlement is server-only — call it from a script or API route")
    const conn = connection()
    const tx = Transaction.from(signedTx)
    const signature = await conn.sendRawTransaction(tx.serialize())
    await conn.confirmTransaction(signature, "confirmed")

    // Recover the item + new owner from the confirmed transaction's post token balances.
    const parsed = await conn.getParsedTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })
    const holder = parsed?.meta?.postTokenBalances?.find((b) => b.uiTokenAmount.amount === "1")
    if (!holder?.owner || !holder.mint) {
      throw new Error("Could not determine new owner from transaction")
    }
    const newOwner = holder.owner
    const store = await readStore()
    const entry = Object.entries(store).find(([, s]) => s.assetAddress === holder.mint)
    if (entry) await recordSale(entry[0], entry[1], newOwner, signature)

    return { signature, newOwner, explorerUrl: explorerTx(signature) }
  },
}
