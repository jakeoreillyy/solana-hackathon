import "dotenv/config"
import { readFileSync } from "node:fs"
import { Connection, Keypair } from "@solana/web3.js"
import { explorerTx } from "@proven/shared"
import {
  PROVEN_ITEM,
  createProvenAsset,
  getItemOwner,
  transferOwnership,
} from "@proven/ownership"

const explorerUrlFor = (signature: string, rpcUrl: string) => {
  if (/127\.0\.0\.1|localhost/.test(rpcUrl)) {
    return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(rpcUrl)}`
  }
  return explorerTx(signature)
}

const loadWallet = (path: string): Keypair => {
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(readFileSync(path, "utf8"))),
  )
}

const main = async () => {
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com"
  const connection = new Connection(rpcUrl, "confirmed")
  const seller = loadWallet(process.env.SELLER_KEYPAIR_PATH ?? ".keys/seller.json")
  const buyer = loadWallet(process.env.BUYER_KEYPAIR_PATH ?? ".keys/buyer.json")

  console.log("--- Proven ownership demo ---")
  console.log("RPC:", rpcUrl)
  console.log("Seller:", seller.publicKey.toBase58())
  console.log("Buyer:", buyer.publicKey.toBase58())

  const sellerBalance = await connection.getBalance(seller.publicKey, "confirmed")
  if (sellerBalance === 0) {
    throw new Error(
      [
        "Seller wallet needs SOL.",
        "Run: npm run airdrop",
        /127\.0\.0\.1|localhost/.test(rpcUrl)
          ? "(local validator must be running: npm run validator)"
          : `Or fund ${seller.publicKey.toBase58()} at https://faucet.solana.com/`,
      ].join(" "),
    )
  }

  const { mint, signature: creationSignature, identity } = await createProvenAsset({
    connection,
    payer: seller,
    seller: seller.publicKey,
    itemId: PROVEN_ITEM.id,
    name: PROVEN_ITEM.name,
    serialNumber: PROVEN_ITEM.serialNumber,
  })

  if (
    identity.itemId !== PROVEN_ITEM.id ||
    identity.serialNumber !== PROVEN_ITEM.serialNumber
  ) {
    throw new Error("Item identity does not match the demo item")
  }
  console.log("Item identity:", identity.name, identity.itemId, identity.serialNumber)

  const ownerBefore = await getItemOwner(connection, mint)
  if (!ownerBefore.equals(seller.publicKey) || ownerBefore.equals(buyer.publicKey)) {
    throw new Error("BEFORE ownership check failed")
  }

  console.log("")
  console.log("BEFORE:")
  console.log("  Seller owns PROVEN-001")
  console.log("  Buyer does not")
  console.log("Asset/mint address:", mint.toBase58())
  console.log("Owner before:", ownerBefore.toBase58())
  console.log("Creation signature:", creationSignature)
  console.log("")
  console.log("TRANSFER")

  const transferSignature = await transferOwnership({
    connection,
    mint,
    seller,
    buyer: buyer.publicKey,
    payer: seller,
  })

  const ownerAfter = await getItemOwner(connection, mint)
  if (!ownerAfter.equals(buyer.publicKey) || ownerAfter.equals(seller.publicKey)) {
    throw new Error("AFTER ownership check failed")
  }

  console.log("")
  console.log("AFTER:")
  console.log("  Seller does not own PROVEN-001")
  console.log("  Buyer owns PROVEN-001")
  console.log("Owner after:", ownerAfter.toBase58())
  console.log("Transfer signature:", transferSignature)
  console.log("Solana Explorer URL:", explorerUrlFor(transferSignature, rpcUrl))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
