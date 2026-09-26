import { create, fetchAssetV1, mplCore } from "@metaplex-foundation/mpl-core"
import { generateSigner, keypairIdentity, publicKey } from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { fromWeb3JsKeypair, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters"
import type { Item } from "@proven/shared"
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js"
import { describe, expect, it } from "vitest"
import {
  SettlementError,
  assertCanSettle,
  executePurchase,
  settlePurchase,
} from "../src/purchase"

const MPL_CORE_PROGRAM_ID = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
const RPC_URL = process.env.SOLANA_RPC_URL

const sellerAddress = Keypair.generate().publicKey.toBase58()
const buyerAddress = Keypair.generate().publicKey.toBase58()

const baseItem = (overrides: Partial<Item> = {}): Item => ({
  id: "PROVEN-001",
  name: "Rolex Submariner",
  description: "Settlement test item",
  serialNumber: "126610LN-8472",
  imageUrl: "",
  priceUsd: 3000,
  priceLamports: "1000000",
  assetAddress: Keypair.generate().publicKey.toBase58(),
  ownerWallet: sellerAddress,
  sellerWallet: sellerAddress,
  sellerVerified: true,
  status: "AVAILABLE",
  history: [],
  ...overrides,
})

describe("settlement checks", () => {
  it("rejects a zero price without sending", () => {
    expect(() => assertCanSettle(baseItem({ priceLamports: "0" }), buyerAddress)).toThrow(
      SettlementError,
    )
    expect(() => assertCanSettle(baseItem({ priceLamports: "0" }), buyerAddress)).toThrow(
      /positive number of lamports/,
    )
  })

  it("rejects a buyer who is the seller without sending", () => {
    expect(() => assertCanSettle(baseItem(), sellerAddress)).toThrow(
      /Buyer and seller must be different wallets/,
    )
  })

  it("rejects an item that is not available without sending", () => {
    expect(() => assertCanSettle(baseItem({ status: "SOLD" }), buyerAddress)).toThrow(
      /Item is SOLD, cannot buy/,
    )
    expect(() => assertCanSettle(baseItem({ status: "PENDING" }), buyerAddress)).toThrow(
      /Item is PENDING, cannot buy/,
    )
  })

  it("rejects a transaction the buyer has not signed", async () => {
    const buyer = Keypair.generate()
    const seller = Keypair.generate()
    const tx = new Transaction({
      feePayer: seller.publicKey,
      blockhash: Keypair.generate().publicKey.toBase58(),
      lastValidBlockHeight: 1,
    })
    tx.add(
      SystemProgram.transfer({
        fromPubkey: buyer.publicKey,
        toPubkey: seller.publicKey,
        lamports: 1,
      }),
    )
    tx.partialSign(seller)
    const bytes = Uint8Array.from(
      tx.serialize({ requireAllSignatures: false, verifySignatures: false }),
    )
    await expect(executePurchase(bytes)).rejects.toThrow(/missing a signature/)
  })
})

describe("local validator atomic swap", () => {
  it.skipIf(!RPC_URL)(
    "pays the seller and transfers the Core asset to the buyer in one transaction",
    async () => {
      const connection = new Connection(RPC_URL ?? "http://127.0.0.1:8899", "confirmed")
      const seller = Keypair.generate()
      const buyer = Keypair.generate()
      const priceLamports = 10_000_000n

      await airdrop(connection, seller.publicKey, LAMPORTS_PER_SOL)
      await airdrop(connection, buyer.publicKey, LAMPORTS_PER_SOL)

      const assetAddress = await mintFixture(connection, seller)
      const before = await connection.getBalance(seller.publicKey, "confirmed")
      const item = baseItem({
        assetAddress,
        ownerWallet: seller.publicKey.toBase58(),
        sellerWallet: seller.publicKey.toBase58(),
        priceLamports: priceLamports.toString(),
      })

      const result = await settlePurchase({ connection, item, buyer, seller })

      const after = await connection.getBalance(seller.publicKey, "confirmed")
      expect(after - before).toBe(Number(priceLamports))
      expect(result.newOwner).toBe(buyer.publicKey.toBase58())
      expect(result.explorerUrl).toContain(result.signature)
      expect(result.explorerUrl).toContain("devnet")

      const umi = createUmi(connection.rpcEndpoint).use(mplCore())
      const asset = await fetchAssetV1(umi, publicKey(assetAddress), { commitment: "confirmed" })
      expect(String(asset.owner)).toBe(buyer.publicKey.toBase58())

      const confirmed = await connection.getTransaction(result.signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      })
      expect(confirmed).toBeTruthy()
      const message = confirmed!.transaction.message
      const accountKeys = message.staticAccountKeys
      const programIds = message.compiledInstructions.map((instruction) =>
        accountKeys[instruction.programIdIndex].toBase58(),
      )
      expect(programIds).toContain(SystemProgram.programId.toBase58())
      expect(programIds).toContain(MPL_CORE_PROGRAM_ID)
    },
    180_000,
  )
})

const mintFixture = async (connection: Connection, seller: Keypair): Promise<string> => {
  const umi = createUmi(connection.rpcEndpoint).use(mplCore())
  umi.use(keypairIdentity(fromWeb3JsKeypair(seller)))
  const asset = generateSigner(umi)
  let builder = create(umi, {
    asset,
    name: "Proven settlement fixture",
    uri: "https://example.com/proven-settlement-fixture.json",
    owner: publicKey(seller.publicKey.toBase58()),
  }).useLegacyVersion()
  builder = await builder.setLatestBlockhash(umi)
  const built = await builder.buildAndSign(umi)
  const signature = await connection.sendRawTransaction(toWeb3JsTransaction(built).serialize(), {
    skipPreflight: false,
  })
  await connection.confirmTransaction(signature, "confirmed")
  return String(asset.publicKey)
}

const airdrop = async (connection: Connection, pubkey: PublicKey, lamports: number) => {
  let lastError: unknown
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const signature = await connection.requestAirdrop(pubkey, lamports)
      const latest = await connection.getLatestBlockhash("confirmed")
      await connection.confirmTransaction(
        { signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
        "confirmed",
      )
      const balance = await connection.getBalance(pubkey, "confirmed")
      if (balance >= lamports) {
        return
      }
      lastError = new Error(`airdrop landed but balance is ${balance}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
  }
  throw lastError
}
