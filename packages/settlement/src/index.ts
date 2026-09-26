import type { SettlementApi } from "@proven/shared"

// One transaction: buyer pays seller in SOL, and the Token-2022 item moves to the buyer.
// Both wallets sign. Escrow is out of scope until this swap is the demo.
export const settlement: SettlementApi = {
  async buy(itemId, buyerWallet) {
    const { buy } = await import("./purchase")
    return buy(itemId, buyerWallet)
  },
  async buildPurchaseTransaction(itemId, buyerWallet) {
    const { buildPurchaseTransaction } = await import("./purchase")
    return buildPurchaseTransaction(itemId, buyerWallet)
  },
  async executePurchase(signedTx) {
    const { executePurchase } = await import("./purchase")
    return executePurchase(signedTx)
  },
}
