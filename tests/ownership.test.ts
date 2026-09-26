import { describe, it, expect } from "vitest"
import {
  PROVEN_ITEM,
  ownership,
  createProvenAsset,
  getItemOwner,
  buildOwnershipTransferInstructions,
  transferOwnership,
  TOKEN_2022_PROGRAM_ID,
} from "@proven/ownership"

describe("ownership exports", () => {
  it("exposes the demo item identity", () => {
    expect(PROVEN_ITEM.id).toBe("PROVEN-001")
    expect(PROVEN_ITEM.name).toBe("Rolex Submariner")
    expect(PROVEN_ITEM.serialNumber).toBe("126610LN-8472")
  })

  it("exports the live Solana helpers Person 2/3 need", () => {
    expect(typeof createProvenAsset).toBe("function")
    expect(typeof getItemOwner).toBe("function")
    expect(typeof buildOwnershipTransferInstructions).toBe("function")
    expect(typeof transferOwnership).toBe("function")
    expect(TOKEN_2022_PROGRAM_ID.toBase58().length).toBeGreaterThan(30)
  })

  it("keeps the shared OwnershipApi facade for the web package", () => {
    expect(ownership).toBeTruthy()
  })
})
