import { describe, it, expect, beforeEach, vi } from "vitest"
import { Keypair, PublicKey } from "@solana/web3.js"
import { isVerified, clearVerifiedCache } from "../src/verify"
import { MEMO_PROGRAM_ID } from "../src/config"

const attester = Keypair.generate().publicKey
const seller = Keypair.generate().publicKey.toBase58()
const buyer = Keypair.generate().publicKey.toBase58()

const memoTx = (feePayer: PublicKey, memo: string) => ({
  meta: { err: null },
  transaction: {
    message: {
      accountKeys: [{ pubkey: feePayer }],
      instructions: [{ programId: MEMO_PROGRAM_ID, parsed: memo }],
    },
  },
})
const payload = (wallet: string) => JSON.stringify({ t: "proven-attestation", v: 1, wallet, level: "demo", at: "x" })

const conn = (tx: unknown) =>
  ({
    getSignaturesForAddress: vi.fn().mockResolvedValue([{ signature: "sig1", err: null }]),
    getParsedTransaction: vi.fn().mockResolvedValue(tx),
  }) as any

const opts = (c: any) => ({ connection: c, attester: attester.toBase58() })

describe("isVerified", () => {
  beforeEach(() => clearVerifiedCache())

  it("false when no attestation exists", async () => {
    const c = { getSignaturesForAddress: vi.fn().mockResolvedValue([]), getParsedTransaction: vi.fn() } as any
    expect(await isVerified(seller, opts(c))).toBe(false)
  })
  it("true for a valid attestation by the attester", async () => {
    expect(await isVerified(seller, opts(conn(memoTx(attester, payload(seller)))))).toBe(true)
  })
  it("false for a different wallet", async () => {
    expect(await isVerified(buyer, opts(conn(memoTx(attester, payload(seller)))))).toBe(false)
  })
  it("false when the fee payer is not the attester", async () => {
    const impostor = Keypair.generate().publicKey
    expect(await isVerified(seller, opts(conn(memoTx(impostor, payload(seller)))))).toBe(false)
  })
  it("false (no throw) on RPC failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const c = { getSignaturesForAddress: vi.fn().mockRejectedValue(new Error("down")) } as any
    expect(await isVerified(seller, opts(c))).toBe(false)
  })
  it("throws on invalid pubkey", async () => {
    await expect(isVerified("nope")).rejects.toThrow(/Invalid wallet/)
  })
})
