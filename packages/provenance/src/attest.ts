// Server/scripts only: needs the attester secret key.
import { readFileSync } from "fs"
import {
  Connection, Keypair, Transaction, TransactionInstruction, sendAndConfirmTransaction,
} from "@solana/web3.js"
import {
  ATTESTATION_TYPE, COMMITMENT, MEMO_PROGRAM_ID, attesterKeypairPath, explorerTxUrl, parsePubkey, rpcUrl,
} from "./config"
import { isVerified, markVerified } from "./verify"

export function loadAttester(path = attesterKeypairPath()): Keypair {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))))
}

export async function attestSeller(
  wallet: string,
  opts: { connection?: Connection; attester?: Keypair } = {},
): Promise<boolean> {
  parsePubkey(wallet)
  const attester = opts.attester ?? loadAttester()
  const conn = opts.connection ?? new Connection(rpcUrl(), COMMITMENT)
  if (await isVerified(wallet, { connection: conn, attester: attester.publicKey.toBase58() })) return true

  // Public by design: no personal data in the memo.
  const memo = JSON.stringify({
    t: ATTESTATION_TYPE, v: 1, wallet, level: "demo", at: new Date().toISOString(),
  })
  const ix = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [{ pubkey: attester.publicKey, isSigner: true, isWritable: false }],
    data: Buffer.from(memo, "utf8"),
  })
  const sig = await sendAndConfirmTransaction(conn, new Transaction().add(ix), [attester], {
    commitment: COMMITMENT,
  })
  markVerified(wallet)
  console.log(`[provenance] attested ${wallet}: ${explorerTxUrl(sig)}`)
  return true
}
