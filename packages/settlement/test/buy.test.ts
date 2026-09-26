import { describe, it, expect } from "vitest"
import { settlement } from "../src"

// These cover the input-validation path, which runs before any RPC or keypair use, so they
// pass without a validator or .keys/ present. The full atomic-swap path is exercised
// end-to-end by scripts/demo.ts against a local validator.
describe("settlement.buy validation", () => {
  const REAL_LOOKING_WALLET = "AnRfHXJYaAH6Yi4ack4Q72gXJv41QWx3F1EAqxiTkko9"

  it("rejects an unknown item before touching the chain", async () => {
    await expect(settlement.buy("NOPE-DOES-NOT-EXIST", REAL_LOOKING_WALLET)).rejects.toThrow(
      /Unknown item/,
    )
  })

  it("rejects an invalid buyer wallet", async () => {
    await expect(settlement.buy("PROVEN-001", "not-a-valid-pubkey")).rejects.toThrow(/buyer/i)
  })

  it("rejects an unknown item for buildPurchaseTransaction too", async () => {
    await expect(
      settlement.buildPurchaseTransaction("NOPE-DOES-NOT-EXIST", REAL_LOOKING_WALLET),
    ).rejects.toThrow(/Unknown item/)
  })
})
