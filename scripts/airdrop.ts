import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { readFileSync } from "fs";
const conn = new Connection(process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com");
for (const n of ["seller", "buyer", "attester"]) {
  const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(`.keys/${n}.json`, "utf8"))));
  try {
    await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
    console.log("airdropped", n);
  } catch {
    console.log("airdrop failed for", n, "- use https://faucet.solana.com");
  }
}
