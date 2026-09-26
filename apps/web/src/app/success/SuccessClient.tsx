"use client"

import { AppShell } from "@/components/AppShell"
import { SettlementProof } from "@/components/SettlementProof"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Item } from "@proven/shared"
import { getOwnership } from "@/lib/client"

export const SuccessClient = () => {
  const searchParams = useSearchParams()
  const itemId = searchParams.get("itemId")
  const signature = searchParams.get("signature")
  const newOwner = searchParams.get("newOwner")
  const explorerUrl = searchParams.get("explorerUrl")
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (!itemId) {
      return
    }
    let cancelled = false
    void getOwnership()
      .getItem(itemId)
      .then((next) => {
        if (!cancelled) {
          setItem(next)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItem(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [itemId])

    return (
    <AppShell activeStep="success">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#1D8348] text-2xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold">Purchase complete</h1>
          <p className="text-[#6E6E73]">
            Payment settled and ownership transferred. You are the new owner.
          </p>
        </div>

        {item ? (
          <div className="rounded-2xl bg-[#F5F5F7] p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#6E6E73]">Item</dt>
                <dd>{item.name}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#6E6E73]">Status</dt>
                <dd>{item.status}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[#6E6E73]">New owner</dt>
                <dd className="break-all font-mono text-xs text-right">
                  {newOwner ?? item.ownerWallet}
                </dd>
              </div>
              {signature ? (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[#6E6E73]">Signature</dt>
                  <dd className="break-all font-mono text-xs text-right">{signature}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        {itemId ? <SettlementProof itemId={itemId} itemStatus={item?.status ?? "SOLD"} /> : null}

        <div className="mx-auto max-w-lg space-y-3">
          {explorerUrl ? (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              aria-label="Open Solana Explorer transaction"
              className="block w-full text-center rounded-full bg-[#0071E3] px-6 py-3.5 text-white font-medium hover:bg-[#0077ED] transition-colors"
            >
              View on Solana Explorer
            </a>
          ) : null}

          {itemId ? (
            <a
              href={`/item/${encodeURIComponent(itemId)}`}
              tabIndex={0}
              aria-label="Back to item listing"
              className="block w-full text-center text-[#0071E3] text-sm hover:underline"
            >
              Back to listing
            </a>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}