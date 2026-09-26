import { describe, it, expect } from "vitest"
import { ownership } from "../src"

// Validation paths that fail before any RPC call, so they run without a validator.
// The mint / transfer path is exercised end-to-end by scripts/demo.ts.
describe("ownership lookups", () => {
  it("getItem rejects an unknown item", async () => {
    await expect(ownership.getItem("NOPE-DOES-NOT-EXIST")).rejects.toThrow(/not found/i)
  })

  it("getItemOwner rejects an unknown item", async () => {
    await expect(ownership.getItemOwner("NOPE-DOES-NOT-EXIST")).rejects.toThrow(/not found/i)
  })

  it("transferOwnership rejects an unknown item", async () => {
    await expect(
      ownership.transferOwnership("NOPE-DOES-NOT-EXIST", "AnRfHXJYaAH6Yi4ack4Q72gXJv41QWx3F1EAqxiTkko9"),
    ).rejects.toThrow(/not found/i)
  })
})
