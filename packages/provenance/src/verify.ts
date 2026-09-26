// Read-only path: safe for the browser (no fs, no secret key).
import { Connection, type Finality, type ParsedTransactionWithMeta } from "@solana/web3.js"
import { ATTESTATION_TYPE, COMMITMENT, MEMO_PROGRAM_ID, attesterPubkeyEnv, parsePubkey, rpcUrl } from "./config"

const FINALITY: Finality = "confirmed"

// Only positive results are cached: a negative can flip after attestSeller.
const verified = new Set<string>()
export const clearVerifiedCache = (wallet?: string) => (wallet ? verified.delete(wallet) : verified.clear())
export const markVerified = (wallet: string) => void verified.add(wallet)

let sharedConn: Connection | undefined
const defaultConnection = () => (sharedConn ??= new Connection(rpcUrl(), COMMITMENT))

/** Return memo strings in a tx if (and only if) the attester is its fee payer. */
function attesterMemos(tx: ParsedTransactionWithMeta, attester: string): string[] {
  if (tx.meta?.err) return []
  const feePayer = tx.transaction.message.accountKeys[0]?.pubkey.toBase58()
  if (feePayer !== attester) return []
  const memos: string[] = []
  for (const ix of tx.transaction.message.instructions) {
    if (!ix.programId.equals(MEMO_PROGRAM_ID)) continue
    if ("parsed" in ix && typeof ix.parsed === "string") memos.push(ix.parsed)
  }
  return memos
}

function matches(memo: string, wallet: string): boolean {
  try {
    const p = JSON.parse(memo)
    return p?.t === ATTESTATION_TYPE && p?.wallet === wallet
  } catch {
    return false
  }
}

const SIGNATURE_LIMIT = 100
const BATCH = 10

export async function isVerified(
  wallet: string,
  opts: { connection?: Connection; attester?: string } = {},
): Promise<boolean> {
  parsePubkey(wallet) // throws on invalid input
  if (verified.has(wallet)) return true
  const attesterStr = opts.attester ?? attesterPubkeyEnv()
  if (!attesterStr) throw new Error("ATTESTER_PUBKEY is not set")
  const attester = parsePubkey(attesterStr, "attester")
  const conn = opts.connection ?? defaultConnection()
  try {
    const sigs = await conn.getSignaturesForAddress(attester, { limit: SIGNATURE_LIMIT }, FINALITY)
    const attesterB58 = attester.toBase58()
    const good = sigs.filter((s) => !s.err)
    // Small batches with early exit: gentle on public RPC rate limits.
    for (let i = 0; i < good.length; i += BATCH) {
      const txs = await Promise.all(
        good.slice(i, i + BATCH).map((s) => conn.getParsedTransaction(s.signature, {
          commitment: FINALITY,
          maxSupportedTransactionVersion: 0,
        })),
      )
      for (const tx of txs) {
        if (tx && attesterMemos(tx, attesterB58).some((m) => matches(m, wallet))) {
          verified.add(wallet)
          return true
        }
      }
    }
    return false
  } catch (e) {
    console.error("[provenance] isVerified RPC failed:", e)
    return false
  }
}
