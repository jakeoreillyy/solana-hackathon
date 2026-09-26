# Proven: slide draft (5 slides, 3 minutes)

## 1. Problem (30s)
Buying a EUR 3,000 watch from a stranger needs three leaps of faith:
- the seller is real
- they actually own the watch
- they will deliver after you pay
Today that trust lives in screenshots, chat messages and hope.

## 2. Proven (30s)
Replace each assumption with something verifiable on Solana:
- verifiable identity -> seller wallet attested as verified
- verifiable ownership -> the item exists on-chain, owned by a wallet
- programmable settlement -> payment and ownership change hands in one transaction

## 3. How it works (30s)
Seller registers item (serial + QR) -> buyer scans QR, sees verified seller + current owner ->
buyer pays; ONE transaction moves the money to the seller and the item to the buyer.
Both happen together or not at all.

## 4. Live demo (60s), see docs/DEMO_SCRIPT.md
Scan QR -> product page (verified, owner = seller) -> Buy securely -> processing -> success
(payment settled, ownership transferred) -> open transaction in Solana Explorer.

## 5. Vision / business (30s)
- Identity: today a demo attestation; production plugs in KYC providers, authorised dealers, marketplaces.
- Physical link: QR today; NFC/PUF chips make the item itself unclonable.
- Trust: escrow with delivery oracle + dispute arbitration; staked seller collateral, slashed for counterfeits.
- Business: small settlement fee, verified-seller subscriptions, dealer/marketplace integrations.
- Market: any high-value peer-to-peer goods (watches, sneakers, art, collectibles).

## Honest limits (say them before judges ask)
- Demo attestation, no real KYC yet.
- QR can be copied; NFC/PUF is the fix.
- Demo runs on a local validator with a demo buyer key; devnet/mainnet is a config change.
