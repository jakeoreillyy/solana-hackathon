# Architecture
Seller wallet --(attested by)--> Verified Seller
Item (serial/QR) --> on-chain asset (Metaplex Core) owned by seller wallet
Buy: ONE atomic tx = buyer pays seller (SOL/USDC) + asset transfers to buyer
Frontend reads item state from chain, shows Explorer link.

Packages: ownership (P2), settlement (P3), provenance (P5), web (P4), shared (contract).
Stretch: programs/escrow (Anchor), NFC/PUF chips, staked seller collateral, oracle-based delivery.
