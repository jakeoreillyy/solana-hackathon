#!/bin/sh
# Local chain with unlimited test SOL. Docker and Podman are not required.
# Clones the Metaplex Core program from devnet (a read, not an airdrop).
export PATH="${HOME}/.local/share/solana/install/active_release/bin:${PATH}"
exec solana-test-validator --reset \
  --ledger /tmp/proven-test-ledger \
  --bind-address 127.0.0.1 \
  --url https://api.devnet.solana.com \
  --clone-upgradeable-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
