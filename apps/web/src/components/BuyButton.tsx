"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { getSettlement } from "@/lib/client"
import { MOCK_BUYER_WALLET } from "@/lib/mock"

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
    router.push(`/processing?itemId=${encodeURIComponent(itemId)}`)

    try {
      // TODO (P4): replace with connected wallet public key once adapter is wired.
      const buyerWallet = MOCK_BUYER_WALLET
      const result = await getSettlement().buy(itemId, buyerWallet)
      const params = new URLSearchParams({
        itemId,
        signature: result.signature,
        newOwner: result.newOwner,
        explorerUrl: result.explorerUrl,
      })
      router.push(`/success?${params.toString()}`)
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
      className="w-full rounded-full bg-[#0071E3] px-6 py-3.5 text-white font-medium hover:bg-[#0077ED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Starting…" : "Buy securely"}
    </button>
  )
}
