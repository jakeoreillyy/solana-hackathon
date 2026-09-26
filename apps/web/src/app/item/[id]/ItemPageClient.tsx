"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Item } from "@proven/shared"
import { BuyButton } from "@/components/BuyButton"
import { ItemCard } from "@/components/ItemCard"
import type { SellerStatus } from "@/components/VerifiedBadge"
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

  if (loadError) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-red-700" role="alert">
          {loadError}
        </p>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>Loading item…</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8">
      {isMockMode() ? (
        <p className="text-xs text-amber-700" role="note">
          Mock mode on (NEXT_PUBLIC_USE_MOCKS). Chain packages unused until set to false.
        </p>
      ) : null}

      {error ? (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <ItemCard item={item} sellerStatus={sellerStatus} />

      <BuyButton itemId={item.id} disabled={item.status !== "AVAILABLE"} />
    </main>
  )
}
