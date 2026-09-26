import "dotenv/config"
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { readFileSync } from "fs"

const url = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
const conn = new Connection(url, "confirmed")
const local = /127\.0\.0\.1|localhost/.test(url)
console.log("network:", url)

let failed = false
for (const n of ["seller", "buyer", "attester"]) {
  const path = process.env[`${n.toUpperCase()}_KEYPAIR_PATH`] ?? `.keys/${n}.json`
  const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))))
  try {
    if ((await conn.getBalance(kp.publicKey)) >= LAMPORTS_PER_SOL / 2) {
      console.log(n, "already funded")
      continue
    }
    const sig = await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL)
    await conn.confirmTransaction(sig, "confirmed")
    console.log("airdropped", n, kp.publicKey.toBase58())
  } catch {
    failed = true
    console.log("airdrop failed for", n, kp.publicKey.toBase58())
  }
}
if (failed) {
  console.log(
    local
      ? "Local validator not running? Start it with: npm run validator"
      : "Devnet faucet is rate-limited. Use https://faucet.solana.com, or run locally: set SOLANA_RPC_URL=http://127.0.0.1:8899 in .env and `npm run validator`.",
  )
  process.exit(1)
}
