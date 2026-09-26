import "dotenv/config"
import { Keypair } from "@solana/web3.js";
import { mkdirSync, writeFileSync } from "fs";
mkdirSync(".keys", { recursive: true });
for (const n of ["seller", "buyer", "attester"]) {
  const kp = Keypair.generate();
  writeFileSync(`.keys/${n}.json`, JSON.stringify(Array.from(kp.secretKey)));
  console.log(n, kp.publicKey.toBase58());
}
