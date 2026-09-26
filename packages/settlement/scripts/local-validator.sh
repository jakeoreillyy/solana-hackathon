#!/bin/sh
# Same local chain as npm run validator. Token-2022 is already on it.
export PATH="${HOME}/.local/share/solana/install/active_release/bin:${PATH}"
exec solana-test-validator --reset --ledger "${TMPDIR:-/tmp}/proven-ledger"
