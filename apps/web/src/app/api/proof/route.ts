import { NextResponse } from "next/server"
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { explorerAddr, explorerTx } from "@proven/shared"
import { ownership } from "@proven/ownership"
import { demoBuyerWallet } from "@proven/settlement"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const rpcUrl = () =>
  process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://127.0.0.1:8899"

const formatSol = (lamports: number) => (lamports / LAMPORTS_PER_SOL).toFixed(4)

/**
 * Live settlement proof for the demo screen. Ownership and balances come from the
 * validator. The seller invoice is the listing price and seller wallet. A sale is
 * paid when the chain owner is no longer the seller and a transfer signature exists.
 */
export async function GET(request: Request) {
  const itemId = new URL(request.url).searchParams.get("itemId")
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 })
  }

  try {
    const item = await ownership.getItem(itemId)
    const buyerWallet = await demoBuyerWallet()
    const conn = new Connection(rpcUrl(), "confirmed")
    const [sellerLamports, buyerLamports, mintInfo] = await Promise.all([
      conn.getBalance(new PublicKey(item.sellerWallet)),
      conn.getBalance(new PublicKey(buyerWallet)),
      conn.getParsedAccountInfo(new PublicKey(item.assetAddress)),
    ])
    const parsed = mintInfo.value?.data
    const mint = parsed && typeof parsed === "object" && "parsed" in parsed ? parsed.parsed.info : null
    const ownershipChanged = item.ownerWallet !== item.sellerWallet
    const sale = ownershipChanged
      ? [...item.history].reverse().find((entry) => entry.owner === item.ownerWallet) ?? null
      : null

    return NextResponse.json({
      itemId: item.id,
      itemName: item.name,
      serialNumber: item.serialNumber,
      priceLamports: item.priceLamports,
      priceSol: (Number(item.priceLamports) / LAMPORTS_PER_SOL).toFixed(4),
      sellerWallet: item.sellerWallet,
      buyerWallet,
      ownerWallet: item.ownerWallet,
      status: item.status,
      ownershipChanged,
      invoicePaid: ownershipChanged && Boolean(sale),
      saleSignature: sale?.signature ?? null,
      sellerSol: formatSol(sellerLamports),
      buyerSol: formatSol(buyerLamports),
      tokenSupply: mint?.supply ?? null,
      tokenDecimals: mint?.decimals ?? null,
      mintAuthorityRevoked: mint ? mint.mintAuthority === null : false,
      mintExplorerUrl: explorerAddr(item.assetAddress),
      ownerExplorerUrl: explorerAddr(item.ownerWallet),
      sellerExplorerUrl: explorerAddr(item.sellerWallet),
      txExplorerUrl: sale ? explorerTx(sale.signature) : null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read settlement proof"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
