import type { OwnershipApi } from "@proven/shared"

// TODO (P2): implement with Metaplex Core (mint asset, transfer, fetch owner)
export const ownership: OwnershipApi = {
  async registerItem() {
    throw new Error("not implemented")
  },
  async getItem() {
    throw new Error("not implemented")
  },
  async getItemOwner() {
    throw new Error("not implemented")
  },
  async transferOwnership() {
    throw new Error("not implemented")
  },
}
