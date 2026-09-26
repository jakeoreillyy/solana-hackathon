# Architecture

Seller wallet --(attested by)--> Verified Seller
Item (serial/QR) --> on-chain asset (Metaplex Core) owned by seller wallet
Buy: ONE atomic tx = buyer pays seller (SOL/USDC) + asset transfers to buyer
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
programs/escrow       STRETCH only — do not start until atomic swap works
```

## UI → Solana boundary
React components must not build raw Solana transactions.
Use `apps/web/src/lib/client.ts` which switches:
- `NEXT_PUBLIC_USE_MOCKS=true` → in-memory mock (AVAILABLE → PENDING → SOLD)
- `NEXT_PUBLIC_USE_MOCKS=false` → real package implementations

No database for MVP. Solana is source of truth for ownership/payment once live.
