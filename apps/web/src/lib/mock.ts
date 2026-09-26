// Mock data so P4 can build UI before the chain is ready. Swap for the real API later.
import type { Item } from "@proven/shared";
export const mockItem: Item = {
  id: "PROVEN-001", name: "Rolex Submariner", serial: "126610LN-8472", priceUsd: 3000,
  assetAddress: "MOCK", owner: "SellerWallet123", seller: "SellerWallet123",
  sellerVerified: true, history: [],
};
