import type { Item, OwnershipApi, ProvenanceEntry } from "@proven/shared"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"

/**
 * Minimal ownership: each item is a 0-decimals SPL token with supply 1 (mint authority
 * revoked), so whoever holds the token owns the item. Swap for Metaplex Core later; the
 * OwnershipApi contract stays the same.
 *
 * Item metadata lives in apps/web/public/items.json (written by scripts/seed.ts, read
 * server-side from disk and browser-side over HTTP). On-chain data is the source of truth
 * for the owner.
 */

const rpcUrl = () =>
  process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
let _conn: Connection | undefined
const connection = () => (_conn ??= new Connection(rpcUrl(), "confirmed"))
const isServer = () => typeof window === "undefined"

/** Absolute path to items.json, anchored to this module's source so CWD doesn't matter. */
async function itemsPath(): Promise<string> {
  const { fileURLToPath } = await import("url")
  return fileURLToPath(new URL("../../../apps/web/public/items.json", import.meta.url))
}

type Stored = Omit<Item, "ownerWallet" | "status" | "sellerVerified">
type Store = Record<string, Stored>

async function readStore(): Promise<Store> {
  if (isServer()) {
    const { readFileSync } = await import("fs")
    try {
      return JSON.parse(readFileSync(await itemsPath(), "utf8"))
    } catch {
      return {}
    }
  }
  const res = await fetch("/items.json", { cache: "no-store" })
  return res.ok ? res.json() : {}
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

/** Demo signers loaded lazily from .env — never load buyer.json unless we actually need it. */
const demoSeller = () => loadKeypair(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
const demoBuyer = () => loadKeypair(process.env.BUYER_KEYPAIR_PATH ?? ".keys/buyer.json")

async function stored(id: string): Promise<Stored> {
  const item = (await readStore())[id]
  if (!item) throw new Error(`Item not found: ${id}`)
  return item
}

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

async function toItem(s: Stored): Promise<Item> {
  const ownerWallet = await ownerOf(s.assetAddress)
  return {
    ...s,
    ownerWallet,
    // Seller verification is a separate on-chain scan; callers that display it
    // (the item page badge) run provenance.isVerified themselves, so we don't
    // pay for it on every read here.
    sellerVerified: false,
    status: ownerWallet === s.sellerWallet ? "AVAILABLE" : "SOLD",
  }
}

export const ownership: OwnershipApi = {
  async registerItem(input) {
    if (!isServer()) throw new Error("registerItem is server-only — call it from a script or API route")
    const { createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } =
      await import("@solana/spl-token")
    const seller = await demoSeller()
    if (seller.publicKey.toBase58() !== input.sellerWallet) {
      throw new Error("sellerWallet does not match SELLER_KEYPAIR_PATH")
    }
    const conn = connection()
    const mint = await createMint(conn, seller, seller.publicKey, null, 0)
    const ata = await getOrCreateAssociatedTokenAccount(conn, seller, mint, seller.publicKey)
    const signature = await mintTo(conn, seller, mint, ata.address, seller, 1)
    await setAuthority(conn, seller, mint, seller, AuthorityType.MintTokens, null) // supply fixed at 1

    const entry: ProvenanceEntry = {
      owner: input.sellerWallet,
      signature,
      at: new Date().toISOString(),
    }
    const record: Stored = {
      ...input,
      assetAddress: mint.toBase58(),
      history: [entry],
    }
    const store = await readStore()
    if (store[input.id]) {
      console.warn(
        `[ownership] registerItem: overwriting ${input.id} (previous asset ${store[input.id].assetAddress}); demo state reset.`,
      )
    }
    store[input.id] = record
    await writeStore(store)
    return toItem(record)
  },

  async getItem(id) {
    return toItem(await stored(id))
  },

  async getItemOwner(id) {
    return ownerOf((await stored(id)).assetAddress)
  },

  async transferOwnership(itemId, toWallet) {
    if (!isServer()) throw new Error("transferOwnership is server-only")
    const { getOrCreateAssociatedTokenAccount, transfer } = await import("@solana/spl-token")
    const s = await stored(itemId)
    const mint = new PublicKey(s.assetAddress)
    const currentOwner = await ownerOf(s.assetAddress)
    // Only load the keypair we actually need — try seller first (initial state), then buyer.
    const seller = await demoSeller()
    const signer =
      seller.publicKey.toBase58() === currentOwner
        ? seller
        : await demoBuyer()
            .then((b) => (b.publicKey.toBase58() === currentOwner ? b : null))
            .catch(() => null) // buyer.json may not exist; fall through to the clear error below
    if (!signer) throw new Error(`No demo keypair for current owner ${currentOwner}`)

    const conn = connection()
    const from = await getOrCreateAssociatedTokenAccount(conn, signer, mint, signer.publicKey)
    const to = await getOrCreateAssociatedTokenAccount(conn, signer, mint, new PublicKey(toWallet))
    const signature = await transfer(conn, signer, from.address, to.address, signer, 1)

    const store = await readStore()
    store[itemId] = {
      ...s,
      history: [...s.history, { owner: toWallet, signature, at: new Date().toISOString() }],
    }
    await writeStore(store)
    return toItem(store[itemId])
  },
}
