import "dotenv/config"
import { readFileSync } from "fs"
import { Keypair } from "@solana/web3.js"
import { ownership } from "@proven/ownership"
import { provenance } from "@proven/provenance"
import { settlement } from "@proven/settlement"
import { explorerAddr, explorerTx } from "@proven/shared"

// End-to-end demo: reset -> verify seller -> buy -> verify buyer owns item -> print proof.
// Each run re-mints a fresh asset owned by the seller, so it is repeatable: run it twice and
// both runs go green. Exits non-zero if any step fails, so a green run can be trusted.

const ITEM_ID = "PROVEN-001"

const pub = (p: string) =>
  Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8")))).publicKey.toBase58()

const seller = pub(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
const buyer = pub(process.env.BUYER_KEYPAIR_PATH ?? ".keys/buyer.json")
process.env.ATTESTER_PUBKEY ??= pub(process.env.ATTESTER_KEYPAIR_PATH ?? ".keys/attester.json")

async function main() {
  console.log("network:", process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com")
  console.log("seller:", seller)
  console.log("buyer: ", buyer)

  // 1. Reset: attest the seller + mint a fresh item asset owned by the seller.
  console.log("\n[1/5] Resetting demo (attest seller + mint item)…")
  await provenance.attestSeller(seller)
  const item = await ownership.registerItem({
    id: ITEM_ID,
    name: "Rolex Submariner",
    description: "Datejust Submariner, black dial. High-value demo listing for Proven.",
    serialNumber: "126610LN-8472",
    imageUrl: "/rolex-submariner.jpg",
    priceUsd: 3000,
    priceLamports: "15000000000",
    sellerWallet: seller,
  })
  console.log("  asset:", explorerAddr(item.assetAddress))

  // 2. Seller verified?
  console.log("\n[2/5] Checking seller verification…")
  if (!(await provenance.isVerified(seller))) throw new Error("seller is not verified")
  console.log("  seller verified ✓")

  // 3. Confirm the seller starts as the owner.
  console.log("\n[3/5] Confirming starting owner…")
  const startOwner = await ownership.getItemOwner(ITEM_ID)
  if (startOwner !== seller) throw new Error(`expected seller to own item, got ${startOwner}`)
  console.log("  owner == seller ✓")

  // 4. Buyer buys: atomic pay + transfer.
  console.log("\n[4/5] Buyer purchasing…")
  const result = await settlement.buy(ITEM_ID, buyer)
  console.log("  signature:", result.signature)

  // 5. Verify the buyer now owns the item on-chain.
  console.log("\n[5/5] Verifying new owner on-chain…")
  const newOwner = await ownership.getItemOwner(ITEM_ID)
  if (newOwner !== buyer) throw new Error(`expected buyer to own item, got ${newOwner}`)
  console.log("  owner == buyer ✓")

  console.log("\n✅ Demo complete")
  console.log("  item:     ", ITEM_ID)
  console.log("  new owner:", newOwner)
  console.log("  tx:       ", explorerTx(result.signature))
}

main().catch((err) => {
  console.error("\n❌ Demo failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
