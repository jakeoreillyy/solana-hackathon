#!/usr/bin/env bash
# Starts a local Solana validator on http://127.0.0.1:8899 (unlimited free airdrops).
# Windows: run inside WSL. Install once: curl -sSfL https://release.anza.xyz/stable/install | sh
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
command -v solana-test-validator >/dev/null || { echo "solana-test-validator not found. Install: curl -sSfL https://release.anza.xyz/stable/install | sh"; exit 1; }
exec solana-test-validator --reset --ledger "${TMPDIR:-/tmp}/proven-ledger"
