// Shared contract between all packages. Change via PR, announce in chat.
export const CLUSTER = "devnet" as const;

export interface Item {
  id: string;            // e.g. PROVEN-001
  name: string;          // Rolex Submariner
  serial: string;        // 126610LN-8472
  priceUsd: number;
  assetAddress: string;  // on-chain asset (mint)
  owner: string;         // current owner wallet
  seller: string;        // seller wallet
  sellerVerified: boolean;
}

export interface PurchaseResult {
  signature: string;
  newOwner: string;
  explorerUrl: string;
}

// Person 2 implements
export interface OwnershipApi {
  registerItem(item: Omit<Item, "assetAddress" | "owner">): Promise<Item>;
  getItem(id: string): Promise<Item>;
}
// Person 3 implements
export interface SettlementApi {
  buy(itemId: string, buyer: string): Promise<PurchaseResult>;
}
// Person 5 implements
export interface ProvenanceApi {
  attestSeller(wallet: string): Promise<boolean>;
  qrFor(itemId: string): Promise<string>;
}
