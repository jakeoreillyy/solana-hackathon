"use client"

import { useState } from "react"

type Perspective = "buyer" | "seller"

const views = {
  buyer: {
    summary: "Know what happens to your money and your item at every step.",
    steps: [
      ["01", "Choose a verified listing.", "Review the seller identity, serial number, and recorded ownership history before you commit.", "YOU CHOOSE"],
      ["02", "Pay into locked escrow.", "Your payment is held for this transaction. The seller cannot access it before pickup is confirmed.", "FUNDS LOCKED"],
      ["03", "Follow the shipment.", "The seller sends the item to the pickup office you selected. The handoff is tied to your purchase.", "IN TRANSIT"],
      ["04", "Collect in person.", "Show your ID through the post office's normal process and take possession of the item.", "YOU COLLECT"],
      ["05", "Pickup is independently confirmed.", "The post office's confirmation, not either party's claim, is the proof that triggers settlement.", "PROOF RECEIVED"],
      ["06", "Receive the ownership record.", "Escrow pays the seller and your on-chain ownership record updates in the same settlement.", "COMPLETE"],
    ],
  },
  seller: {
    summary: "Ship with confidence that payment is already secured and tied to the handoff.",
    steps: [
      ["01", "Verify your identity.", "Connect your verified seller identity to your Solana wallet so buyers can check who listed the item.", "SELLER VERIFIED"],
      ["02", "Register and list your item.", "Record the serial number and provenance, then set your price. Your wallet is recorded as the current owner.", "LISTED"],
      ["03", "Wait for secured payment.", "The buyer's payment is placed in transaction-specific escrow before you send anything. Neither party can move it alone.", "FUNDS LOCKED"],
      ["04", "Ship to the selected office.", "Send the item to the post office chosen by the buyer and keep the shipment linked to the sale.", "IN TRANSIT"],
      ["05", "The buyer collects the item.", "The post office checks the buyer's identity and independently confirms the in-person pickup.", "PICKUP CONFIRMED"],
      ["06", "Receive payment automatically.", "The confirmation releases escrow to you while the item's on-chain ownership record transfers to the buyer.", "PAID"],
    ],
  },
} as const

export const PerspectiveFlow = () => {
  const [perspective, setPerspective] = useState<Perspective>("buyer")
  const view = views[perspective]

  return (
    <>
      <div className="flow-heading">
        <div>
          <p className="system-eyebrow">THE SALE, STEP BY STEP</p>
          <h2 id="flow-title">The system, simply.</h2>
        </div>
        <p>One transaction. A physical pickup. A release signal neither party controls.</p>
      </div>

      <div className="perspective-header">
        <div className="perspective-switch" role="group" aria-label="Choose a perspective">
          {(["buyer", "seller"] as const).map((option) => (
            <button
              aria-pressed={perspective === option}
              className={perspective === option ? "perspective-button selected" : "perspective-button"}
              key={option}
              onClick={() => setPerspective(option)}
              type="button"
            >
              {option === "buyer" ? "I'm buying" : "I'm selling"}
            </button>
          ))}
        </div>
        <p aria-live="polite">{view.summary}</p>
      </div>

      <ol className="system-timeline" aria-label={`${perspective} transaction steps`}>
        {view.steps.map(([number, title, text, status]) => (
          <li className="system-step" key={number}>
            <span className="system-step-number">{number}</span>
            <div className="system-step-copy">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <span className="system-actor">{status}</span>
          </li>
        ))}
      </ol>
      <div className="escrow-note">
        <span className="escrow-note-mark" aria-hidden="true">↳</span>
        <p><strong>The rule:</strong> only independent pickup confirmation releases the funds. Until then, escrow holds them for this transaction.</p>
      </div>
    </>
  )
}