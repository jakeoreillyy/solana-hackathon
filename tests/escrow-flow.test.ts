import { beforeEach, describe, expect, it } from "vitest"
import {
  getMockListings,
  mockOwnership,
  mockSettlement,
  MOCK_SELLER_WALLET,
  resetMockItem,
} from "../apps/web/src/lib/mock"

const BUYER_WALLET = "BuyerWalletTest11111111111111111111111111"

describe("mock escrow flow", () => {
  beforeEach(() => {
    resetMockItem()
  })

  it("keeps ownership with the seller until pickup is confirmed", async () => {
    const before = await mockOwnership.getItem("PROVEN-001")
    const deposit = await mockSettlement.buy("PROVEN-001", BUYER_WALLET)
    const held = await mockOwnership.getItem("PROVEN-001")

    expect(deposit.signature).toContain("MockEscrowDeposit")
    expect(held.status).toBe("PENDING")
    expect(held.ownerWallet).toBe(before.ownerWallet)

    const settlement = await mockSettlement.confirmPickup("PROVEN-001", BUYER_WALLET)
    const completed = await mockOwnership.getItem("PROVEN-001")

    expect(settlement.signature).toContain("MockPickupConfirmed")
    expect(completed.status).toBe("SOLD")
    expect(completed.ownerWallet).toBe(BUYER_WALLET)
  })

  it("adds a registered seller item to the marketplace catalog", async () => {
    const item = await mockOwnership.registerItem({
      id: "LISTING-TEST-001",
      name: "Cartier Love Bracelet",
      category: "jewelry",
      description: "A demo seller listing.",
      serialNumber: "CARTIER-1234",
      imageUrl: "data:image/png;base64,dGVzdA==",
      priceUsd: 7500,
      priceLamports: "37500000000",
      sellerWallet: MOCK_SELLER_WALLET,
    })

    expect(item.status).toBe("AVAILABLE")
    expect(getMockListings().some((listing) => listing.id === item.id)).toBe(true)
  })
})