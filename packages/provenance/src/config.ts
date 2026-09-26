import { PublicKey, type Commitment } from "@solana/web3.js"

export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
export const ATTESTATION_TYPE = "proven-attestation"
export const COMMITMENT: Commitment = "confirmed"

export const rpcUrl = () =>
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.devnet.solana.com"

export const attesterPubkeyEnv = () =>
  process.env.ATTESTER_PUBKEY ?? process.env.NEXT_PUBLIC_ATTESTER_PUBKEY

export const attesterKeypairPath = () => process.env.ATTESTER_KEYPAIR_PATH ?? ".keys/attester.json"

/** Parse a base58 pubkey or throw a clear error. */
export function parsePubkey(value: string, label = "wallet"): PublicKey {
  try {
    return new PublicKey(value)
  } catch {
    throw new Error(`Invalid ${label} public key: "${value}"`)
  }
}

/** Explorer link that also works for a local validator (custom cluster). */
export function explorerTxUrl(sig: string): string {
  const url = rpcUrl()
  return /127\.0\.0\.1|localhost/.test(url)
    ? `https://explorer.solana.com/tx/${sig}?cluster=custom&customUrl=${encodeURIComponent(url)}`
    : `https://explorer.solana.com/tx/${sig}?cluster=devnet`
}
