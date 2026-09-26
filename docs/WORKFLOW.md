# Team workflow
- Branches: feat/pitch, feat/ownership, feat/settlement, feat/frontend, feat/integration
- Stay inside your folder. Shared contract = packages/shared (PR + announce).
- Commit small, merge to main at least hourly. Rebase on main before merging.
- T-90min: feature freeze. Person 5 owns end-to-end run (`npm run demo`).
- Setup: `nvm use && npm install && cp .env.example .env && npm run wallets && npm run airdrop`

## No devnet SOL? (faucet rate-limited)
1. Install Solana tools once (Mac/Linux/WSL): `curl -sSfL https://release.anza.xyz/stable/install | sh`
2. In `.env` set `SOLANA_RPC_URL=http://127.0.0.1:8899`
3. Terminal A: `npm run validator` (Windows: `npm run validator:win`) - leave running
4. Terminal B: `npm run wallets && npm run airdrop && npm run seed`
Note: the local network is private to your machine; switch back to the devnet URL for the shared demo.
