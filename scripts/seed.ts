import "dotenv/config"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { Keypair } from "@solana/web3.js"
import { provenance, itemUrl } from "@proven/provenance"
import { ownership } from "@proven/ownership"
import { explorerAddr } from "@proven/shared"

const ITEM_ID = "PROVEN-001"

const pub = (p: string) => Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8")))).publicKey.toBase58()
const seller = pub(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
process.env.ATTESTER_PUBKEY ??= pub(process.env.ATTESTER_KEYPAIR_PATH ?? ".keys/attester.json")

await provenance.attestSeller(seller)
console.log("seller verified:", await provenance.isVerified(seller))

// Mint the item to the seller. Re-running seed mints a fresh asset owned by the
// seller and repoints the mapping, which resets the demo (buyer holds nothing).
const registered = await ownership.registerItem({
  id: ITEM_ID,
  name: "Rolex Submariner",
  description: "Datejust Submariner, black dial. High-value demo listing for Proven.",
  serialNumber: "126610LN-8472",
  imageUrl: "/rolex-submariner.jpg",
  priceUsd: 3000,
  priceLamports: "15000000000",
  sellerWallet: seller,
})

// ownership.registerItem also saves ITEM_ID -> asset in apps/web/public/items.json.
console.log(`registered ${ITEM_ID} ->`, explorerAddr(registered.assetAddress))

const owner = await ownership.getItemOwner(ITEM_ID)
if (owner !== seller) throw new Error(`seed check failed: owner ${owner} !== seller ${seller}`)
console.log("owner on chain:", owner)

const qrPath = "docs/pitch/screenshots/PROVEN-001-qr.png"
const qr = await provenance.qrFor(ITEM_ID)
mkdirSync("docs/pitch/screenshots", { recursive: true })
writeFileSync(qrPath, Buffer.from(qr.split(",")[1], "base64"))
console.log(`wrote ${qrPath} ->`, itemUrl(ITEM_ID))
