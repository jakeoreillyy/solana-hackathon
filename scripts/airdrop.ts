import "dotenv/config"
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { readFileSync } from "fs"

const url = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
const conn = new Connection(url, "confirmed")
const local = /127\.0\.0\.1|localhost/.test(url)
console.log("network:", url)

const main = async () => {
  let failed = false
  for (const name of ["seller", "buyer", "attester"]) {
    const path =
      process.env[`${name.toUpperCase()}_KEYPAIR_PATH`] ?? `.keys/${name}.json`
    const keypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))),
    )
    const pubkey = keypair.publicKey.toBase58()
    try {
      if ((await conn.getBalance(keypair.publicKey)) >= LAMPORTS_PER_SOL / 2) {
        console.log(name, "already funded", pubkey)
        continue
      }
      const signature = await conn.requestAirdrop(
        keypair.publicKey,
        2 * LAMPORTS_PER_SOL,
      )
      await conn.confirmTransaction(signature, "confirmed")
      console.log("airdropped", name, pubkey)
    } catch {
      failed = true
      console.log("airdrop failed for", name, pubkey)
    }
  }
  if (failed) {
    console.log(
      local
        ? "Local validator not running? Start it with: npm run validator"
        : "Devnet faucet is rate-limited. Use a local chain: set SOLANA_RPC_URL=http://127.0.0.1:8899 in .env and run `npm run validator`.",
    )
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
