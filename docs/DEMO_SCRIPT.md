# Demo script (3 min) — Person 5 keeps this runnable

Runs on a **local validator** (devnet faucet is rate-limited). One device, no browser wallet:
the buyer is a demo keypair the server signs with.

## Setup (once)
```
cp .env.example .env          # then set SOLANA_RPC_URL=http://127.0.0.1:8899 for local
npm install
npm run validator             # Windows: npm run validator:win  (keep running in its own terminal)
npm run wallets               # writes .keys/{seller,buyer,attester}.json — prints ATTESTER pubkey
# paste the printed attester pubkey into .env as ATTESTER_PUBKEY and NEXT_PUBLIC_ATTESTER_PUBKEY
npm run airdrop               # fund seller + buyer on the local validator
```

## Option A — scripted end-to-end (fastest, provable)
```
npm run demo
```
Resets (attests seller + mints a fresh item), buys as the buyer, verifies the buyer now owns
the item on-chain, and prints the Explorer tx link. Exits non-zero if any step fails, so a
green run can be trusted. Repeatable — run it again and it re-mints and re-buys.

## Option B — live in the browser (the actual pitch)
1. `npm run seed` — attest seller + mint the item (owner = seller). Also writes the QR to
   `docs/pitch/screenshots/PROVEN-001-qr.png`.
2. Set `NEXT_PUBLIC_USE_MOCKS=false` in `.env`, then `npm run dev`.
3. Scan the QR (or open `/item/PROVEN-001`) → product page: seller **verified**, owner = seller,
   provenance history, real Explorer links.
4. Press **Buy securely** → `/processing` → the server route runs the atomic pay + transfer.
5. `/success`: real signature, new owner = buyer, **View on Solana Explorer** (custom cluster).
6. Reload the item page → status **SOLD**, owner = buyer, a second provenance entry.

Reset between runs: `npm run seed` (or `npm run demo`, which resets itself).
