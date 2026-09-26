# Solana ownership (localnet / Token-2022)

Person 2 owns this package.

## API

| Function | Purpose |
|---|---|
| `createProvenAsset(...)` | Mint Token-2022 asset (decimals 0, supply 1, seller owns it, mint authority revoked) |
| `getItemOwner(connection, mint)` | Resolve current owner wallet from **chain state** |
| `buildOwnershipTransferInstructions(...)` | Return transfer (+ buyer ATA) instructions **without submitting** |
| `transferOwnership(...)` | Convenience wrapper that submits those instructions |

Store the returned mint address as the item's `assetAddress`.

> Token-2022 on-chain metadata extension was dropped for hackathon reliability on local validators. Item id / serial are returned from `createProvenAsset().identity`.

## Local chain (recommended while faucets are down)

```sh
# Terminal A — leave running
npm run validator

# Terminal B
# .env must have: SOLANA_RPC_URL=http://127.0.0.1:8899
npm run wallets   # once
npm run airdrop
npm run demo:ownership
```

Windows: `npm run validator:win` (WSL).

## What Person 3 imports

```ts
import {
  buildOwnershipTransferInstructions,
  TOKEN_2022_PROGRAM_ID,
} from "@proven/ownership"
```

Append those instructions to the same `Transaction` as the payment ix, then get **buyer + seller** signatures. Do **not** call `transferOwnership()` in the purchase path.
