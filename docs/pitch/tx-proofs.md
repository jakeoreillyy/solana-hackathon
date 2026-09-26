# Transaction proofs

Captured from the one-device demo (browser flow, real mode) on a local Solana validator.
Local links open in Solana Explorer via its custom-cluster option (`customUrl=http://127.0.0.1:8899`),
so they only load while the validator is running. Replace with devnet links once devnet SOL is available.

| Step | What it proves | Signature |
|---|---|---|
| Seller attestation | Seller wallet is verified (attester-signed memo) | run `npm run seed`, copy the printed link |
| Item minted | PROVEN-001 owned by the seller wallet | run `npm run seed`, copy the printed link |
| Purchase (atomic) | Buyer paid seller and received the item in ONE transaction | `4UGJrZpbCF7xsMrtw3WfhZ2BY91jeuGza4cmeHM35TdNfeUfPRtv4uTR83DxGFDMivWmxxpjZFPTN8yL5UxoN4di` |

Explorer link for the purchase:
https://explorer.solana.com/tx/4UGJrZpbCF7xsMrtw3WfhZ2BY91jeuGza4cmeHM35TdNfeUfPRtv4uTR83DxGFDMivWmxxpjZFPTN8yL5UxoN4di?cluster=custom&customUrl=http%3A%2F%2F127.0.0.1%3A8899

Screenshots to capture during the live run: product page (verified badge, current owner), processing
state, success page (new owner + signature), Explorer transaction view.
