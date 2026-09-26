// Shared contract between all packages. Change via PR, announce in chat.
export const CLUSTER = "devnet" as const;
export const explorerTx = (sig: string) => `https://explorer.solana.com/tx/${sig}?cluster=${CLUSTER}`;
export const explorerAddr = (a: string) => `https://explorer.solana.com/address/${a}?cluster=${CLUSTER}`;

export interface Item {
  id: string;            // PROVEN-001
  name: string;          // Rolex Submariner
  serial: string;        // 126610LN-8472
  priceUsd: number;
  assetAddress: string;  // on-chain asset
  owner: string;         // current owner wallet
  seller: string;
  sellerVerified: boolean;
  history: { owner: string; signature: string; at: string }[];
}

export interface PurchaseResult { signature: string; newOwner: string; explorerUrl: string }

export interface OwnershipApi {          // Person 2
  registerItem(i: Omit<Item, "assetAddress" | "owner" | "history" | "sellerVerified">): Promise<Item>;
  getItem(id: string): Promise<Item>;
}
export interface SettlementApi {         // Person 3
  buy(itemId: string, buyerWallet: string): Promise<PurchaseResult>;
}
export interface ProvenanceApi {         // Person 5
  attestSeller(wallet: string): Promise<boolean>;
  isVerified(wallet: string): Promise<boolean>;
  qrFor(itemId: string): Promise<string>;
}
