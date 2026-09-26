# Proven — Hackathon Product Context

## What we are building

**Proven** is a trust layer for buying and selling high-value physical goods between strangers.

The problem:

When someone buys an expensive item such as a watch, artwork, collectible, camera, or designer bag from another person online, they usually have to trust:

1. the seller is who they claim to be;
2. the seller actually owns the item;
3. the item has the provenance/history claimed;
4. the seller will deliver after receiving payment.

Proven uses Solana to make these things independently verifiable.

---

## Core idea

**Verified identity + verifiable ownership + secure settlement.**

A physical item has a corresponding digital ownership record on Solana.

Example:

A seller owns a €3,000 Rolex.

The Rolex has:

- a unique item ID;
- serial number;
- QR code;
- digital ownership record;
- current owner wallet;
- provenance / previous ownership history.

The seller's wallet also has a simple verified-seller attestation.

A buyer can therefore see:

- Seller Verified ✓
- Ownership Verified ✓
- Item identity / serial ✓
- Current owner ✓
- Provenance ✓
- Price

When the buyer purchases the item:

Buyer payment → Seller

and

Item ownership → Buyer

The goal is for those two changes to settle together or through a coordinated Solana transaction.

After purchase, the buyer becomes the recorded owner and the transaction can be verified through Solana Explorer.

---

# Example user journey

## Before purchase

Seller:
- owns Rolex PROVEN-001
- wallet: SellerWallet
- Verified Seller ✓

Buyer:
- owns funds
- wallet: BuyerWallet

Item:

Rolex Submariner  
Serial: 126610LN-8472  
Current Owner: SellerWallet  
Price: 3,000 USDC / hackathon test equivalent

## Purchase

Buyer clicks:

**Buy Securely**

Buyer signs the Solana transaction.

## After purchase

Seller:
- receives payment

Buyer:
- becomes owner of PROVEN-001

Application displays:

- Purchase Complete ✓
- Seller Paid ✓
- Ownership Transferred ✓
- New Owner: BuyerWallet
- View on Solana Explorer

---

# Why Solana?

Solana is NOT being added just as a crypto payment method.

It provides the shared trust layer.

### Identity

A verification attestation can be associated with a wallet.

For the hackathon this can be a simple demo verification rather than production KYC.

### Ownership

The item's digital ownership record identifies which wallet currently owns the asset.

### Provenance

Ownership transfers can create a verifiable history of the item.

### Settlement

Payment and ownership can be transferred together without requiring the marketplace itself to maintain the authoritative ownership ledger.

---

# Physical ↔ digital connection

Blockchain alone cannot prove that a physical Rolex is genuine.

For the MVP we represent the connection using:

Physical item
→ serial number
→ QR code
→ Proven item ID
→ Solana ownership record

Do NOT claim that we have solved physical authentication.

Future versions could integrate:

- manufacturers;
- authorized dealers;
- galleries;
- professional authentication companies;
- NFC / secure hardware tags.

---

# Hackathon MVP

We are building ONLY the core experience.

The demo should support:

1. Open an item listing.
2. Show the item's serial / identity.
3. Show Verified Seller.
4. Show current owner.
5. Show provenance.
6. Connect buyer wallet.
7. Click Buy Securely.
8. Sign transaction.
9. Transfer payment.
10. Transfer ownership.
11. Display buyer as new owner.
12. Show Solana Explorer transaction.

This flow is the priority above ALL additional features.

---

# Demo item

For consistency, use one primary demo asset:

**Rolex Submariner**

Example data:

- ID: PROVEN-001
- Serial: 126610LN-8472
- Seller Verified: true
- Status: AVAILABLE
- Current owner: seller wallet
- Price: demo/test amount

Do not build multiple product categories unless the core demo is already complete.

---

# Architecture principles

Use TypeScript wherever practical.

Preferred stack:

- Next.js
- React
- TypeScript
- Tailwind
- Solana devnet
- Solana TypeScript SDKs

There is currently NO requirement for:

- database;
- production backend;
- production KYC;
- custom Rust/Anchor program.

Solana-specific logic should be separated from React UI.

Conceptually:

Frontend
↓
clean Solana service/API
↓
Solana

Do not scatter raw Solana transaction construction throughout React components.

---

# Shared domain concepts

Important entities include:

## ProvenItem

Represents a physical item's digital identity and ownership.

Important fields:

- id
- name
- description
- serialNumber
- imageUrl
- assetAddress
- ownerWallet
- sellerWallet
- sellerVerified
- price
- status

## ProvenanceEntry

Represents registration or transfer of ownership.

## PurchaseResult

Represents the result of the purchase/settlement process.

Reuse existing shared types rather than creating competing versions.

---

# Scope restrictions

DO NOT independently add:

- Supabase/Firebase/database
- account/password authentication
- production KYC
- manufacturer integrations
- shipping APIs
- dispute-resolution system
- sophisticated marketplace search
- recommendation engine
- messaging
- reputation system
- Docker
- microservices
- Redux
- custom Rust program
- complicated escrow

unless specifically requested by the team.

Do not expand scope because something would be useful in a production product.

This is a hackathon MVP.

---

# Mock mode

The frontend should remain usable even while blockchain work is unfinished.

Mock mode can simulate:

AVAILABLE
→ PROCESSING
→ SOLD

and simulate ownership changing from seller to buyer.

The real Solana implementation should eventually sit behind the same interface.

Do not create multiple competing mock architectures.

---

# Team ownership

### Frontend developer
Owns:
- pages
- components
- visual states
- item page
- provenance UI
- transaction progress
- success screen

### Ownership developer
Owns:
- item registration
- digital ownership representation
- owner lookup
- ownership transfer

### Payment developer
Owns:
- payment
- purchase transaction
- settlement logic

### Integration developer
Owns:
- wallet integration
- seller verification
- QR / serial connection
- connecting frontend + Solana
- testing
- final demo stability

### Pitch owner
Owns:
- slides
- problem explanation
- demo narrative
- business potential
- presentation

---

# Definition of done

The project is successful when we can demonstrate:

BEFORE:

Seller owns item  
Buyer owns money

↓

BUY SECURELY

↓

AFTER:

Seller receives money  
Buyer owns item

and the ownership/payment result can be independently verified on Solana.

If a proposed feature does not materially help us demonstrate this before the hackathon deadline, it is lower priority.

---

# Instructions for coding agents

Before making changes:

1. Read this file.
2. Inspect existing code before creating new architecture.
3. Preserve working implementations.
4. Work only within the assigned responsibility unless integration requires otherwise.
5. Reuse existing shared types and APIs.
6. Do not expand product scope.
7. Do not introduce major dependencies without a clear reason.
8. Keep the hackathon deadline in mind.
9. Prefer a reliable working demo over production-grade complexity.
10. After changes, report exactly what files were modified and any integration requirements.
