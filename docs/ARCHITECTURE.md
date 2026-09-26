# Architecture

Seller wallet --(attested by)--> Verified Seller
Item (serial/QR) --> on-chain asset (Metaplex Core) owned by seller wallet
Buy: buyer deposits payment into transaction-specific escrow; seller still owns the item
Pickup: independent post-office confirmation releases escrow and transfers item ownership
No pickup: after the agreed window, return the item and refund the buyer
Dispute: hold escrow for independent review before releasing funds
Frontend reads item state from chain (or mocks), shows Explorer link.

## Layout (responsibilities, not bureaucracy)
```
apps/web              UI only — pages/components; call src/lib/client.ts
packages/shared       Domain types + API contracts (ProvenItem/Item, PurchaseResult)
packages/ownership    registerItem / getItem / getItemOwner / transferOwnership
packages/settlement   buy / buildPurchaseTransaction / executePurchase
packages/provenance   attestSeller / verifySeller / qrFor
scripts/              wallets, airdrop, seed, demo
docs/                 architecture, tasks, demo script, pitch
programs/escrow       Planned on-chain escrow enforcement; current web flow is mocked
```

## UI → Solana boundary
React components must not build raw Solana transactions.
Use `apps/web/src/lib/client.ts` which switches:
- `NEXT_PUBLIC_USE_MOCKS=true` → in-memory mock (AVAILABLE → PENDING → SOLD)
- `NEXT_PUBLIC_USE_MOCKS=false` → real package implementations

No database for MVP. Solana is source of truth for ownership/payment once live.
