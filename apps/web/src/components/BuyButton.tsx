"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { PurchaseResult } from "@proven/shared"
import { getSettlement, isMockMode } from "@/lib/client"
import { MOCK_BUYER_WALLET } from "@/lib/mock"

/**
 * Real mode: settlement is server-only (signs with the demo buyer keypair), so the buy runs
 * behind /api/buy. Mock mode stays fully client-side so UI work needs no chain.
 */
const runPurchase = async (itemId: string): Promise<PurchaseResult> => {
  if (isMockMode()) {
    return getSettlement().buy(itemId, MOCK_BUYER_WALLET)
  }
  const res = await fetch("/api/buy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ itemId }),
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(body?.error ?? "Purchase failed")
  }
  return body as PurchaseResult
}

type BuyButtonProps = {
  itemId: string
  disabled?: boolean
}

export const BuyButton = ({ itemId, disabled = false }: BuyButtonProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) {
      return
    }

    setIsLoading(true)

    try {
      const result = await runPurchase(itemId)
      const params = new URLSearchParams({
        itemId,
        escrowSignature: result.signature,
      })
      router.push(`/processing?${params.toString()}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Purchase failed"
      router.push(`/item/${encodeURIComponent(itemId)}?error=${encodeURIComponent(message)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      void handleClick()
    }
  }

    return (
    <button
      type="button"
      onClick={() => void handleClick()}
      onKeyDown={handleKeyDown}
      disabled={disabled || isLoading}
      tabIndex={0}
      aria-label="Buy securely"
      className="buy-secure-button"
    >
      {isLoading ? "Securing funds…" : "Buy securely"}
    </button>
  )
}
