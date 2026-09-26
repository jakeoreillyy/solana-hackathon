// Shared contract between all packages. Change via PR, announce in chat.
export const CLUSTER = "devnet" as const

export type SolanaNetwork = "devnet" | "mainnet-beta" | "testnet"

export type ItemStatus = "AVAILABLE" | "PENDING" | "SOLD"

export interface ProvenanceEntry {
  owner: string
  signature: string
  at: string
}

/** Domain item — aka ProvenItem. Keep `Item` name to avoid churn across packages. */
export interface Item {
  id: string
  name: string
  description: string
  serialNumber: string
  imageUrl: string
  priceUsd: number
  priceLamports: string
  assetAddress: string
  ownerWallet: string
  sellerWallet: string
  sellerVerified: boolean
  status: ItemStatus
  history: ProvenanceEntry[]
}

/** Alias for teams that prefer the product name in types. */
export type ProvenItem = Item

export interface PurchaseResult {
  signature: string
  newOwner: string
  explorerUrl: string
}

export const explorerTx = (sig: string, network: SolanaNetwork = CLUSTER) =>
  `https://explorer.solana.com/tx/${sig}?cluster=${network}`

export const explorerAddr = (a: string, network: SolanaNetwork = CLUSTER) =>
  `https://explorer.solana.com/address/${a}?cluster=${network}`

export const getExplorerUrl = explorerTx

export type RegisterItemInput = Omit<
  Item,
  "assetAddress" | "ownerWallet" | "history" | "sellerVerified" | "status"
> & {
  sellerWallet: string
}

/** Person 2 — ownership / item representation */
export interface OwnershipApi {
  registerItem(input: RegisterItemInput): Promise<Item>
  getItem(id: string): Promise<Item>
  getItemOwner(id: string): Promise<string>
  transferOwnership(itemId: string, toWallet: string): Promise<Item>
}

/** Person 3 — payment + atomic settlement */
export interface SettlementApi {
  /** High-level: pay seller + transfer ownership in one flow */
  buy(itemId: string, buyerWallet: string): Promise<PurchaseResult>
  /** Lower-level hooks for building/signing when wallet adapter is wired */
  buildPurchaseTransaction(itemId: string, buyerWallet: string): Promise<Uint8Array>
  executePurchase(signedTx: Uint8Array): Promise<PurchaseResult>
}

/** Person 5 — seller verification, QR / item linkage */
export interface ProvenanceApi {
  attestSeller(wallet: string): Promise<boolean>
  isVerified(wallet: string): Promise<boolean>
  /** Alias naming for verifySeller() in product docs */
  verifySeller(wallet: string): Promise<boolean>
  qrFor(itemId: string): Promise<string>
}
