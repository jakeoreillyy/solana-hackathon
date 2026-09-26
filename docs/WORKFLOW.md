# Team workflow
- Branches: feat/pitch, feat/ownership, feat/settlement, feat/frontend, feat/integration
- Stay inside your folder. Shared contract = packages/shared (PR + announce).
- Commit small, merge to main at least hourly. Rebase on main before merging.
- T-90min: feature freeze. Person 5 owns end-to-end run (`npm run demo`).
- Setup: `nvm use && npm install && cp .env.example .env && npm run wallets && npm run airdrop`
