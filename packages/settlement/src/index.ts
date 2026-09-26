import type { SettlementApi } from "@proven/shared";
// TODO (P3): one atomic tx = payment (buyer->seller) + asset transfer (seller->buyer)
export const settlement: SettlementApi = {
  async buy() { throw new Error("not implemented"); },
};
