# Proven
Decentralized trust layer for buying high-value physical items from strangers, on Solana.

| Person | Area | Folder | Branch |
|---|---|---|---|
| 1 | Pitch | docs/pitch | feat/pitch |
| 2 | Ownership | packages/ownership | feat/ownership |
| 3 | Settlement | packages/settlement | feat/settlement |
| 4 | Frontend | apps/web | feat/frontend |
| 5 | Provenance + integration | packages/provenance, scripts | feat/integration |

## Who owns what

| Person | Role | Work in these folders | Don't edit |
|---|---|---|---|
| 1 | Pitch / explanation | `docs/pitch/` (slides, `screenshots/`, `tx-proofs.md`) | everything else |
| 2 | Solana ownership | `packages/ownership/` | other packages |
| 3 | Payment + settlement | `packages/settlement/` (stretch: `programs/escrow/`) | other packages |
| 4 | Frontend | `apps/web/` (`src/app`, `src/components`, `src/lib`) | `packages/*` |
| 5 | Provenance + integration | `packages/provenance/`, `scripts/`, `docs/DEMO_SCRIPT.md` | other packages |

Shared by everyone (PR + announce in chat): `packages/shared/`, root config, `.github/`.

Rules: stay in your folder; shared types live in `packages/shared` (PR + announce); merge to `main` often.

## Quick start
```
nvm use && npm install
cp .env.example .env
npm run wallets && npm run airdrop
npm run dev
```
See docs/WORKFLOW.md, docs/ARCHITECTURE.md, docs/TASKS.md, docs/DEMO_SCRIPT.md.
