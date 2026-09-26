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

const STORAGE_KEY = "proven-mock-items"
const MOCK_BUYER = "BuyerWalletMock1111111111111111111111111"
const MOCK_SELLER = "SellerWalletMock11111111111111111111111"

const seedItem = (): Item => ({
  id: "PROVEN-001",
  name: "Rolex Submariner",
  category: "watches",
  description: "Datejust Submariner, black dial. High-value demo listing for Proven.",
  serialNumber: "126610LN-8472",
  imageUrl:
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=90",
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

const seedItems = (): Item[] => {
  const watch = seedItem()
  const makeItem = (
    id: string,
    category: string,
    name: string,
    description: string,
    serialNumber: string,
    imageUrl: string,
    priceUsd: number,
    priceLamports: string,
    assetAddress: string,
  ): Item => ({
    ...watch,
    id,
    category,
    name,
    description,
    serialNumber,
    imageUrl,
    priceUsd,
    priceLamports,
    assetAddress,
    history: [
      {
        owner: MOCK_SELLER,
        signature: `MockMintSignature-${id}`,
        at: "2026-09-01T12:00:00.000Z",
      },
    ],
  })

  return [
    watch,
    makeItem(
      "PROVEN-002",
      "cameras",
      "Leica M11 Rangefinder",
      "Black finish digital rangefinder camera, verified seller and ownership history.",
      "5572184-M11",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
      8995,
      "44975000000",
      "MockAsset-LeicaM11-2222222222222222222222222222",
    ),
    makeItem(
      "PROVEN-003",
      "bags",
      "Hermes Kelly 28",
      "Structured leather top-handle bag with documented seller and ownership history.",
      "K28-2021-4482",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
      11800,
      "59000000000",
      "MockAsset-Kelly28-3333333333333333333333333333",
    ),
    makeItem(
      "PROVEN-004",
      "guitars",
      "Gibson Custom 1959 Les Paul",
      "Custom shop electric guitar with verified seller and a traceable ownership record.",
      "R9-ULP-204815",
      "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1200&q=85",
      6200,
      "31000000000",
      "MockAsset-GibsonR9-4444444444444444444444444444",
    ),
  ]
}

let memoryStore: Item[] = seedItems()

const readStore = (): Item[] => {
  if (typeof window !== "undefined") {
    const raw =
      window.sessionStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem("proven-mock-item")
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Item | Item[]
        if (Array.isArray(parsed)) {
          memoryStore = parsed
        } else {
          memoryStore = seedItems().map((item) =>
            item.id === parsed.id ? parsed : item,
          )
        }
      } catch {
        memoryStore = seedItems()
      }
    }
  }
  return structuredClone(memoryStore)
}

const writeStore = (items: Item[]) => {
  memoryStore = items
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }
}

const writeItem = (nextItem: Item) => {
  const items = readStore()
  const index = items.findIndex((item) => item.id === nextItem.id)
  if (index < 0) {
    items.push(nextItem)
  } else {
    items[index] = nextItem
  }
  writeStore(items)
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const resetMockItem = () => {
  writeStore(seedItems())
}

/** Static seed snapshot for docs/tests. Prefer mockOwnership.getItem in UI flows. */
export const mockItem: Item = seedItem()
export const mockListings: Item[] = seedItems()
export const getMockListings = (): Item[] => readStore()
export const MOCK_SELLER_WALLET = MOCK_SELLER

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
    writeItem(next)
    return structuredClone(next)
  },

  async getItem(id) {
    const item = readStore().find((candidate) => candidate.id === id)
    if (!item) {
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
    writeItem(next)
    return structuredClone(next)
  },
}

export const mockSettlement: SettlementApi = {
  async buy(itemId, buyerWallet) {
    const item = await mockOwnership.getItem(itemId)
    if (item.status !== "AVAILABLE") {
      throw new Error(`Item is ${item.status}, cannot buy`)
    }

    writeItem({ ...item, status: "PENDING" })
    await delay(600)

    const signature = `MockEscrowDeposit-${Date.now()}`

    const result: PurchaseResult = {
      signature,
      newOwner: item.ownerWallet,
      explorerUrl: explorerTx(signature),
    }
    return result
  },

  async confirmPickup(itemId, buyerWallet) {
    const item = await mockOwnership.getItem(itemId)
    if (item.status !== "PENDING") {
      throw new Error(`Item is ${item.status}, cannot confirm pickup`)
    }

    await delay(400)
    const signature = `MockPickupConfirmed-${Date.now()}`
    await mockOwnership.transferOwnership(itemId, buyerWallet)

    return {
      signature,
      newOwner: buyerWallet,
      explorerUrl: explorerTx(signature),
    }
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
    const items = readStore().map((item) =>
      item.sellerWallet === wallet ? { ...item, sellerVerified: true } : item,
    )
    writeStore(items)
    return true
  },

  async isVerified(wallet) {
    return readStore().some(
      (item) => wallet === item.sellerWallet && item.sellerVerified,
    )
  },

  async verifySeller(wallet) {
    return mockProvenance.isVerified(wallet)
  },

  async qrFor(itemId) {
    return `proven://item/${itemId}`
  },
}

export const MOCK_BUYER_WALLET = MOCK_BUYER
