import { NextResponse } from "next/server"
import { demoBuyerWallet, settlement } from "@proven/settlement"

// Server-only: settlement signs with the demo buyer keypair (fs + secret key), so this must
// run in the Node runtime and never be statically cached.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * One-device demo buy: no browser wallet. The buyer is the server-side demo keypair, so the
 * client only needs to say which item. Returns the PurchaseResult (signature, new owner,
 * Explorer link) or a clear error message.
 */
export async function POST(request: Request) {
  try {
    const { itemId } = (await request.json()) as { itemId?: string }
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 })
    }
    const buyerWallet = await demoBuyerWallet()
    const result = await settlement.buy(itemId, buyerWallet)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
