"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Item } from "@proven/shared"
import { BuyButton } from "@/components/BuyButton"
import { ItemCard } from "@/components/ItemCard"
import { AppShell } from "@/components/AppShell"
import { getOwnership, isMockMode } from "@/lib/client"

type ItemPageClientProps = {
  id: string
}

export const ItemPageClient = ({ id }: ItemPageClientProps) => {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [item, setItem] = useState<Item | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const next = await getOwnership().getItem(id)
        if (!cancelled) {
          setItem(next)
          setLoadError(null)
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
      <div className="mx-auto max-w-2xl space-y-8">
        {isMockMode() ? (
          <p className="text-xs text-[#6E6E73] text-center" role="note">
            Mock mode on (NEXT_PUBLIC_USE_MOCKS). Chain packages unused until set to false.
          </p>
        ) : null}

        {error ? (
          <p
            className="rounded-2xl bg-[#FFF1F0] p-4 text-sm text-[#D70015]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <ItemCard item={item} />

        <BuyButton itemId={item.id} disabled={item.status !== "AVAILABLE"} />
      </div>
    </AppShell>
  )
}