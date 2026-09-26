"use client"

import { useEffect, useState } from "react"

type SettlementProofData = {
  itemName: string
  serialNumber: string
  priceSol: string
  sellerWallet: string
  buyerWallet: string
  ownerWallet: string
  ownershipChanged: boolean
  invoicePaid: boolean
  saleSignature: string | null
  sellerSol: string
  buyerSol: string
  tokenSupply: string | null
  tokenDecimals: number | null
  mintAuthorityRevoked: boolean
  mintExplorerUrl: string
  ownerExplorerUrl: string
  sellerExplorerUrl: string
  txExplorerUrl: string | null
}

type SettlementProofProps = {
  itemId: string
  itemStatus: string
}

const ProofLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={0}
    aria-label={label}
    className="proof-link"
  >
    {label}
  </a>
)

export const SettlementProof = ({ itemId, itemStatus }: SettlementProofProps) => {
  const [proof, setProof] = useState<SettlementProofData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/proof?itemId=${encodeURIComponent(itemId)}`, { cache: "no-store" })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.error ?? "Could not read settlement proof")
        if (!cancelled) {
          setProof(body as SettlementProofData)
          setError(null)
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not read settlement proof")
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [itemId, itemStatus])

  return (
    <section className="proof" aria-label="Settlement proof">
      <div className="proof-head">
        <h2>Show this to the room</h2>
        <span>READ FROM THE VALIDATOR</span>
      </div>
      <p className="proof-intro">
        Three checks for the same sale: the seller&apos;s invoice, the SOL payment, and who holds the item token.
        Each address opens on Solana Explorer.
      </p>

      {error ? <p className="proof-error" role="alert">{error}</p> : null}
      {!proof && !error ? <p className="proof-intro">Reading the validator…</p> : null}

      {proof ? (
        <div className="proof-grid">
          <article className="proof-card">
            <p className="proof-kicker">{proof.invoicePaid ? "Paid" : "Open invoice"}</p>
            <h3>Seller invoice</h3>
            <p>
              {proof.sellerWallet === proof.ownerWallet ? "The seller is requesting" : "The seller requested"}{" "}
              <strong>{proof.priceSol} SOL</strong> for {proof.itemName}, serial {proof.serialNumber}.
            </p>
            <p className="proof-address">{proof.sellerWallet}</p>
            <ProofLink href={proof.sellerExplorerUrl} label="Seller wallet on Explorer" />
          </article>

          <article className="proof-card">
            <p className="proof-kicker">{proof.ownershipChanged ? "Moved" : "Still with seller"}</p>
            <h3>Ownership</h3>
            <p>
              The item is a supply-{proof.tokenSupply ?? "1"} token
              {proof.tokenDecimals === 0 ? ", decimals 0" : ""}
              {proof.mintAuthorityRevoked ? ", mint authority revoked" : ""}.
              Current holder is the {proof.ownershipChanged ? "buyer" : "seller"}.
            </p>
            <p className="proof-address">{proof.ownerWallet}</p>
            <ProofLink href={proof.ownerExplorerUrl} label="Current owner on Explorer" />
            <ProofLink href={proof.mintExplorerUrl} label="Item token on Explorer" />
          </article>

          <article className="proof-card">
            <p className="proof-kicker">{proof.saleSignature ? "Recorded" : "Waiting for buy"}</p>
            <h3>Payment</h3>
            {proof.saleSignature ? (
              <p>Buy sent {proof.priceSol} SOL to the seller and moved the token in that same transaction.</p>
            ) : (
              <p>Press Buy securely. One transaction pays this invoice and moves the token together.</p>
            )}
            <dl className="proof-balances">
              <div>
                <dt>Seller</dt>
                <dd>{proof.sellerSol} SOL</dd>
              </div>
              <div>
                <dt>Buyer</dt>
                <dd>{proof.buyerSol} SOL</dd>
              </div>
            </dl>
            {proof.saleSignature ? <p className="proof-address">{proof.saleSignature}</p> : null}
            {proof.txExplorerUrl ? (
              <ProofLink href={proof.txExplorerUrl} label="Payment transaction on Explorer" />
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  )
}
