import "./standards.css"
import { SiteHeader } from "@/components/SiteHeader"

const standards = [
  {
    number: "01",
    title: "Know who is selling.",
    text: "Seller identity is verified and linked to the wallet that lists the item. Buyers can see who stands behind a listing.",
    detail: "IDENTITY",
  },
  {
    number: "02",
    title: "Keep the item's history with it.",
    text: "A serial-linked ownership record makes provenance visible and gives every transfer a shared reference point.",
    detail: "PROVENANCE",
  },
  {
    number: "03",
    title: "Release money on independent proof.",
    text: "Payment stays locked until the post office confirms in-person pickup. Neither buyer nor seller can trigger release alone.",
    detail: "SETTLEMENT",
  },
]

export default function OurStandardPage() {
  return (
    <main className="standard-page">
      <SiteHeader activePage="our-standard" />

      <section className="standard-hero">
        <p className="standard-eyebrow">TRUSTTAG · THE STANDARD</p>
        <h1>Trust should be<br />part of the product.</h1>
        <p>Every high-value item deserves more than a promise in a message thread. We build a clear record around the people, the object, and the handoff.</p>
      </section>

      <section className="standard-grid" aria-label="TrustTag standards">
        {standards.map((standard) => (
          <article className="standard-card" key={standard.number}>
            <div className="standard-card-top">
              <span>{standard.number}</span>
              <span>{standard.detail}</span>
            </div>
            <h2>{standard.title}</h2>
            <p>{standard.text}</p>
            <span className="standard-card-mark" aria-hidden="true">↗</span>
          </article>
        ))}
      </section>

      <section className="standard-boundaries" aria-labelledby="boundaries-title">
        <div>
          <p className="standard-eyebrow">A FAIR HANDOFF, BY DESIGN</p>
          <h2 id="boundaries-title">Clear rules.<br />For both sides.</h2>
        </div>
        <div className="standard-rule-list">
          <p><span>Before pickup</span>Funds remain locked in transaction-specific escrow.</p>
          <p><span>At pickup</span>An independent post-office record confirms the physical handoff.</p>
          <p><span>If pickup doesn't happen</span>The agreed window expires, the item returns, and the buyer is refunded.</p>
          <p><span>If there's a dispute</span>Settlement pauses for independent review of the evidence.</p>
        </div>
      </section>

      <aside className="standard-demo-note">
        <span className="standard-note-dot" />
        <p><strong>Prototype status</strong> Seller verification and item provenance are demonstrated in the current prototype. Post-office attestations, automated refunds, and independent arbitration remain planned integrations.</p>
      </aside>

      <footer className="standard-footer">
        <a className="wordmark" href="/">TrustTag</a>
        <span>Objects worth keeping. Stories worth knowing.</span>
        <a href="/">Back to marketplace <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  )
}