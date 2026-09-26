/**
 * In-memory mock so the frontend can demo AVAILABLE → PROCESSING → SOLD
 * without a working chain. Toggle via NEXT_PUBLIC_USE_MOCKS=true.
 *
 * Persists to sessionStorage in the browser so App Router navigations
 * (server vs client bundles) still see the same purchase state.
 */
import {
  explorerTx,
  type Item,
  type OwnershipApi,
  type ProvenanceApi,
  type PurchaseResult,
  type SettlementApi,
} from "@proven/shared"

const STORAGE_KEY = "proven-mock-item"
const MOCK_BUYER = "BuyerWalletMock1111111111111111111111111"
const MOCK_SELLER = "SellerWalletMock11111111111111111111111"

const seedItem = (): Item => ({
  id: "PROVEN-001",
  name: "Rolex Submariner",
  description: "Datejust Submariner, black dial. High-value demo listing for Proven.",
  serialNumber: "126610LN-8472",
  imageUrl: "/rolex-submariner.jpg",
  priceUsd: 3000,
  priceLamports: "15000000000",
  assetAddress: "MockAsset1111111111111111111111111111111",
  ownerWallet: MOCK_SELLER,
  sellerWallet: MOCK_SELLER,
  sellerVerified: true,
  status: "AVAILABLE",
  history: [
    {
      owner: MOCK_SELLER,
      signature: "MockMintSignature111111111111111111111",
      at: "2026-09-01T12:00:00.000Z",
    },
  ],
})

let memoryStore: Item = seedItem()

const readStore = (): Item => {
  if (typeof window !== "undefined") {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        memoryStore = JSON.parse(raw) as Item
      } catch {
        memoryStore = seedItem()
      }
    }
  }
  return structuredClone(memoryStore)
}

const writeStore = (item: Item) => {
  memoryStore = item
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(item))
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const resetMockItem = () => {
  writeStore(seedItem())
}

/** Static seed snapshot for docs/tests. Prefer mockOwnership.getItem in UI flows. */
export const mockItem: Item = seedItem()

export const mockOwnership: OwnershipApi = {
  async registerItem(input) {
    const next: Item = {
      ...seedItem(),
      ...input,
      assetAddress: `MockAsset-${input.id}`,
      ownerWallet: input.sellerWallet,
      sellerWallet: input.sellerWallet,
      sellerVerified: false,
      status: "AVAILABLE",
      history: [
        {
          owner: input.sellerWallet,
          signature: `MockRegister-${input.id}`,
          at: new Date().toISOString(),
        },
      ],
    }
    writeStore(next)
    return structuredClone(next)
  },

  async getItem(id) {
    const item = readStore()
    if (id !== item.id) {
      throw new Error(`Item not found: ${id}`)
    }
    return item
  },

  async getItemOwner(id) {
    const item = await mockOwnership.getItem(id)
    return item.ownerWallet
  },

  async transferOwnership(itemId, toWallet) {
    const item = await mockOwnership.getItem(itemId)
    const next: Item = {
      ...item,
      ownerWallet: toWallet,
      status: "SOLD",
      history: [
        ...item.history,
        {
          owner: toWallet,
          signature: `MockTransfer-${Date.now()}`,
          at: new Date().toISOString(),
        },
      ],
    }
    writeStore(next)
    return structuredClone(next)
  },
}

export const mockSettlement: SettlementApi = {
  async buy(itemId, buyerWallet) {
    const item = await mockOwnership.getItem(itemId)
    if (item.status !== "AVAILABLE") {
      throw new Error(`Item is ${item.status}, cannot buy`)
    }

    writeStore({ ...item, status: "PENDING" })
    await delay(600)

    const signature = `MockPurchase-${Date.now()}`
    await mockOwnership.transferOwnership(itemId, buyerWallet)

    const result: PurchaseResult = {
      signature,
      newOwner: buyerWallet,
      explorerUrl: explorerTx(signature),
    }
    return result
  },

  async buildPurchaseTransaction(itemId, buyerWallet) {
    const payload = JSON.stringify({ itemId, buyerWallet, mock: true })
    return new TextEncoder().encode(payload)
  },

  async executePurchase(signedTx) {
    const payload = JSON.parse(new TextDecoder().decode(signedTx)) as {
      itemId: string
      buyerWallet: string
    }
    return mockSettlement.buy(payload.itemId, payload.buyerWallet)
  },
}

export const mockProvenance: ProvenanceApi = {
  async attestSeller(wallet) {
    const item = readStore()
    if (item.sellerWallet === wallet) {
      writeStore({ ...item, sellerVerified: true })
    }
    return true
  },

  async isVerified(wallet) {
    const item = readStore()
    if (wallet === item.sellerWallet) {
      return item.sellerVerified
    }
    return false
  },

  async verifySeller(wallet) {
    return mockProvenance.isVerified(wallet)
  },

  async qrFor(itemId) {
    return `proven://item/${itemId}`
  },
}

export const MOCK_BUYER_WALLET = MOCK_BUYER
