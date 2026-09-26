import "dotenv/config"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { Keypair } from "@solana/web3.js"
import { provenance, itemUrl } from "@proven/provenance"

const pub = (p: string) => Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8")))).publicKey.toBase58()
const seller = pub(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
process.env.ATTESTER_PUBKEY ??= pub(process.env.ATTESTER_KEYPAIR_PATH ?? ".keys/attester.json")

// TODO (P5): register PROVEN-001 owned by seller
await provenance.attestSeller(seller)
console.log("seller verified:", await provenance.isVerified(seller))

const qrPath = "docs/pitch/screenshots/PROVEN-001-qr.png"
const qr = await provenance.qrFor("PROVEN-001")
mkdirSync("docs/pitch/screenshots", { recursive: true })
writeFileSync(qrPath, Buffer.from(qr.split(",")[1], "base64"))
console.log(`wrote ${qrPath} ->`, itemUrl("PROVEN-001"))
