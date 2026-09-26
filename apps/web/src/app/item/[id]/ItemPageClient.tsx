"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Item } from "@proven/shared"
import { AppShell } from "@/components/AppShell"
import { BuyButton } from "@/components/BuyButton"
import { ItemCard } from "@/components/ItemCard"
import { SettlementProof } from "@/components/SettlementProof"
import { VerifiedBadge, type SellerStatus } from "@/components/VerifiedBadge"
import { getOwnership, getProvenance, isMockMode } from "@/lib/client"

type ItemPageClientProps = {
  id: string
}

export const ItemPageClient = ({ id }: ItemPageClientProps) => {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [item, setItem] = useState<Item | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setSellerStatus(undefined)

    const load = async () => {
      try {
        const next = await getOwnership().getItem(id)
        if (cancelled) return
        setItem(next)
        setLoadError(null)

        // Real mode: check the seller on-chain. Mock mode keeps item.sellerVerified.
        if (isMockMode()) return
        setSellerStatus("loading")
        try {
          const ok = await getProvenance().isVerified(next.sellerWallet)
          if (!cancelled) setSellerStatus(ok ? "verified" : "unverified")
        } catch (err) {
          console.error("[web] seller verification failed:", err)
          if (!cancelled) setSellerStatus("unverified")
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load item")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  const badgeStatus: SellerStatus =
    sellerStatus ?? (item?.sellerVerified ? "verified" : "unverified")

  if (loadError) {
    return (
      <AppShell activeStep="item">
        <p className="text-[#D70015]" role="alert">
          {loadError}
        </p>
      </AppShell>
    )
  }

  if (!item) {
    return (
      <AppShell activeStep="item">
        <p className="text-[#6E6E73]">Loading item…</p>
      </AppShell>
    )
  }

  return (
    <AppShell activeStep="item">
      <div className="product-page">
        <a className="product-back-link" href="/#browse">← Back to marketplace</a>
        {error ? (
          <p
            className="rounded-2xl bg-[#FFF1F0] p-4 text-sm text-[#D70015]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="product-purchase-grid">
          <ItemCard item={item} sellerStatus={sellerStatus} />
          <aside className="checkout-panel" aria-label="Secure checkout">
            <p className="checkout-eyebrow">TRUSTTAG SECURE PURCHASE</p>
            <p className="checkout-price">${item.priceUsd.toLocaleString()}</p>
            <p className="checkout-caption">One protected transaction</p>
            <VerifiedBadge status={badgeStatus} />
            {isMockMode() ? (
              <div className="checkout-steps">
                <div><span>01</span><p>Payment is locked in escrow</p></div>
                <div><span>02</span><p>Seller ships to your pickup office</p></div>
                <div><span>03</span><p>Pickup confirmation releases payment</p></div>
              </div>
            ) : (
              <div className="checkout-steps">
                <div><span>01</span><p>Seller invoice states the price and wallet</p></div>
                <div><span>02</span><p>Buy pays that invoice in SOL</p></div>
                <div><span>03</span><p>The same transaction moves the item token</p></div>
              </div>
            )}
            <BuyButton itemId={item.id} disabled={item.status !== "AVAILABLE"} />
            <p className="checkout-assurance">
              {isMockMode()
                ? "Your money stays protected until the handoff is independently confirmed."
                : "After you buy, the proof below is read from the validator. Explorer links open the same accounts."}
            </p>
            {item.status !== "AVAILABLE" ? <p className="checkout-status">This item is {item.status.toLowerCase()}.</p> : null}
          </aside>
        </div>
        {isMockMode() ? null : <SettlementProof itemId={item.id} itemStatus={item.status} />}
      </div>
    </AppShell>
  )
}
