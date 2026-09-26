"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Item } from "@proven/shared"
import { AppShell } from "@/components/AppShell"
import { getOwnership, getSettlement, isMockMode } from "@/lib/client"
import { MOCK_BUYER_WALLET } from "@/lib/mock"

const milestones = [
  "Payment held in escrow",
  "Seller ships to post office",
  "Buyer collects the item",
  "Post office confirms pickup",
]

const dublinPostOffices = [
  {
    id: "gpo",
    name: "General Post Office",
    area: "Dublin 1",
    address: "O'Connell Street Lower, Dublin 1, D01 F5P2",
    url: "https://www.anpost.com/Store-Locator/GPO",
  },
  {
    id: "rathmines",
    name: "Rathmines Post Office",
    area: "Dublin 6",
    address: "280 Rathmines Road Lower, Dublin 6, D06 PY19",
    url: "https://www.anpost.com/Store-Locator/RATHMINES",
  },
  {
    id: "ballsbridge",
    name: "Ballsbridge Post Office",
    area: "Dublin 4",
    address: "3-7 Bath Avenue, Dublin 4, D04 VXA0",
    url: "https://www.anpost.com/Store-Locator/BALLSBRIDGE",
  },
  {
    id: "drumcondra",
    name: "Drumcondra Post Office",
    area: "Dublin 9",
    address: "32-38 Drumcondra Road Lower, Dublin 9, D09 DT62",
    url: "https://www.anpost.com/Store-Locator/DRUMCONDRA-ROAD",
  },
  {
    id: "tallaght",
    name: "Tallaght Post Office",
    area: "Dublin 24",
    address: "The Square, Belgard Square East, Dublin 24, D24 RKF9",
    url: "https://www.anpost.com/Store-Locator/tallaght",
  },
]

export const ProcessingClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const itemId = searchParams.get("itemId")
  const escrowSignature = searchParams.get("escrowSignature")
  const progressStorageKey = itemId && escrowSignature
    ? `trusttag-escrow-${itemId}-${escrowSignature}`
    : null
  const [item, setItem] = useState<Item | null>(null)
  const [phase, setPhase] = useState(0)
  const [officeId, setOfficeId] = useState("gpo")
  const [error, setError] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [disputeText, setDisputeText] = useState("")
  const [disputeSubmitted, setDisputeSubmitted] = useState(false)
  const selectedOffice = dublinPostOffices.find((office) => office.id === officeId) ?? dublinPostOffices[0]

  useEffect(() => {
    if (!progressStorageKey) return
    try {
      const stored = window.sessionStorage.getItem(progressStorageKey)
      if (!stored) return
      const progress = JSON.parse(stored) as { phase?: number; disputeSubmitted?: boolean; officeId?: string }
      setPhase(Math.max(0, Math.min(2, progress.phase ?? 0)))
      setDisputeSubmitted(progress.disputeSubmitted ?? false)
      if (dublinPostOffices.some((office) => office.id === progress.officeId)) {
        setOfficeId(progress.officeId!)
      }
    } catch {
      window.sessionStorage.removeItem(progressStorageKey)
    }
  }, [progressStorageKey])

  useEffect(() => {
    if (!itemId) {
      setError("This escrow session is missing its item reference.")
      return
    }

    let cancelled = false
    void getOwnership()
      .getItem(itemId)
      .then((nextItem) => {
        if (!cancelled) setItem(nextItem)
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load this escrow.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [itemId])

  const handleContinue = async () => {
    if (phase < 2) {
      const nextPhase = phase + 1
      setPhase(nextPhase)
      if (progressStorageKey) {
        window.sessionStorage.setItem(progressStorageKey, JSON.stringify({ phase: nextPhase, disputeSubmitted, officeId }))
      }
      return
    }
    if (!itemId || !isMockMode()) return

    setIsWorking(true)
    setError(null)
    try {
      const result = await getSettlement().confirmPickup(itemId, MOCK_BUYER_WALLET)
      if (progressStorageKey) window.sessionStorage.removeItem(progressStorageKey)
      const params = new URLSearchParams({
        itemId,
        signature: result.signature,
        newOwner: result.newOwner,
        explorerUrl: result.explorerUrl,
      })
      router.push(`/success?${params.toString()}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pickup confirmation failed.")
      setIsWorking(false)
    }
  }

  const handleDispute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (disputeText.trim()) {
      setDisputeSubmitted(true)
      if (progressStorageKey) {
        window.sessionStorage.setItem(progressStorageKey, JSON.stringify({ phase, disputeSubmitted: true, officeId }))
      }
    }
  }

  const handleOfficeChange = (nextOfficeId: string) => {
    setOfficeId(nextOfficeId)
    if (progressStorageKey) {
      window.sessionStorage.setItem(progressStorageKey, JSON.stringify({ phase, disputeSubmitted, officeId: nextOfficeId }))
    }
  }

  return (
    <AppShell activeStep="processing">
      <section className="escrow-flow" aria-labelledby="escrow-title">
        <p className="eyebrow"><span className="live-dot" /> PAYMENT SECURED</p>
        <h1 id="escrow-title">Your money is held safely.</h1>
        <p className="escrow-intro">
          Funds are locked for this sale. The seller is not paid and ownership has not transferred.
          Only the post office's pickup confirmation releases escrow.
        </p>

        {item ? (
          <div className="escrow-item-summary">
            <img src={item.imageUrl} alt="" />
            <div>
              <span>ESCROW ITEM</span>
              <strong>{item.name}</strong>
              <small>${item.priceUsd.toLocaleString()} · {item.id}</small>
            </div>
            <span className="escrow-locked-badge">LOCKED</span>
          </div>
        ) : null}

        <div className="escrow-location">
          <label htmlFor="pickup-office">Choose a Dublin post office for pickup</label>
          <select id="pickup-office" onChange={(event) => handleOfficeChange(event.target.value)} value={officeId}>
            {dublinPostOffices.map((office) => (
              <option key={office.id} value={office.id}>{office.name} · {office.area}</option>
            ))}
          </select>
          <div className="escrow-office-details" aria-live="polite">
            <p><strong>{selectedOffice.name}</strong><span>{selectedOffice.address}</span></p>
            <a href={selectedOffice.url} rel="noreferrer" target="_blank">An Post branch details <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <ol className="escrow-progress" aria-label="Escrow and delivery progress">
          {milestones.map((milestone, index) => {
            const complete = index === 0 || index <= phase
            return (
              <li className={`escrow-progress-step${complete ? " complete" : ""}`} key={milestone}>
                <span className="escrow-progress-number">{complete ? "✓" : index + 1}</span>
                <span>{milestone}</span>
                <span className="escrow-progress-state">{complete ? "COMPLETE" : index === phase + 1 ? "NEXT" : "UP NEXT"}</span>
              </li>
            )
          })}
        </ol>

        <div className="escrow-controls">
          <p className="escrow-message">
            {phase === 0
              ? `Next, the seller ships the item to ${selectedOffice.name}.`
              : phase === 1
                ? `The parcel is at ${selectedOffice.name}. The buyer collects it in person.`
                : `The buyer has collected the item at ${selectedOffice.name}. The independent pickup record can now release payment.`}
          </p>
          {error ? <p className="text-sm text-[#B83D37]" role="alert">{error}</p> : null}
          <button
            className="escrow-action"
            disabled={isWorking || !item || item.status !== "PENDING" || !isMockMode() || disputeSubmitted}
            onClick={() => void handleContinue()}
            type="button"
          >
            <span>{disputeSubmitted ? "Awaiting independent review" : isWorking ? "Confirming pickup..." : phase === 0 ? "Simulate seller shipping" : phase === 1 ? "Simulate buyer pickup" : "Confirm pickup at post office"}</span>
            <span aria-hidden="true">↗</span>
          </button>
          <p className="escrow-demo-note">
            {isMockMode()
              ? `Demo controls simulate shipping and collection at ${selectedOffice.name}. Only the final post-office confirmation transfers ownership.`
              : "Delivery and post-office confirmation are not connected in this environment."}
          </p>
          {escrowSignature ? <p className="escrow-demo-note">Escrow receipt: {escrowSignature}</p> : null}
          {phase === 2 && !disputeSubmitted ? (
            <form className="escrow-dispute" onSubmit={handleDispute}>
              <label htmlFor="dispute-reason">Item arrived damaged or not as described?</label>
              <textarea
                id="dispute-reason"
                onChange={(event) => setDisputeText(event.target.value)}
                placeholder="Describe the issue for independent review"
                required
                rows={3}
                value={disputeText}
              />
              <button type="submit">Open a dispute</button>
            </form>
          ) : null}
          {disputeSubmitted ? (
            <p className="escrow-dispute-status" role="status">
              Dispute recorded. Escrow remains locked while an independent reviewer decides where the funds go.
            </p>
          ) : null}
        </div>
        <p className="escrow-timeout-note">
          No pickup within 14 days? The protocol returns the item to the seller and refunds the buyer. The timeout and arbitration services are not automated in this demo.
        </p>
      </section>
    </AppShell>
  )
}