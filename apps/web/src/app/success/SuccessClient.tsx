"use client"

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
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-3xl font-semibold">Purchase complete</h1>
      <p className="text-neutral-600">
        Payment settled and ownership transferred. You are the new owner.
      </p>

      {item ? (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">Item</dt>
            <dd>{item.name}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Status</dt>
            <dd>{item.status}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">New owner</dt>
            <dd className="break-all font-mono text-xs">
              {newOwner ?? item.ownerWallet}
            </dd>
          </div>
          {signature ? (
            <div>
              <dt className="text-neutral-500">Signature</dt>
              <dd className="break-all font-mono text-xs">{signature}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {explorerUrl ? (
        <p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            tabIndex={0}
            aria-label="Open Solana Explorer transaction"
          >
            View on Solana Explorer
          </a>
        </p>
      ) : null}

      {itemId ? (
        <p>
          <a
            href={`/item/${encodeURIComponent(itemId)}`}
            className="underline"
            tabIndex={0}
            aria-label="Back to item listing"
          >
            Back to listing
          </a>
        </p>
      ) : null}
    </main>
  )
}
