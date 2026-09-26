import "./system.css"
import { PerspectiveFlow } from "./PerspectiveFlow"
import { SiteHeader } from "@/components/SiteHeader"

const roles = [
  {
    number: "01",
    name: "Buyer",
    text: "Funds the purchase into escrow, then collects the item in person.",
  },
  {
    number: "02",
    name: "Seller",
    text: "Registers an owned item, ships it, and receives payment after confirmed pickup.",
  },
  {
    number: "03",
    name: "Post office",
    text: "Checks the buyer at pickup and supplies independent proof that the handoff happened.",
  },
]

const trustLayers = [
  {
    number: "01",
    title: "Identity",
    text: "A verified seller is connected to the wallet that lists and transfers the item.",
  },
  {
    number: "02",
    title: "Provenance",
    text: "A serial-linked digital record makes the item's recorded ownership history visible.",
  },
  {
    number: "03",
    title: "Settlement",
    text: "Programmable escrow coordinates payment and ownership when the agreed proof arrives.",
  },
]

export default function HowItWorksPage() {
  return (
    <main className="system-page">
      <SiteHeader activePage="how-it-works" />

      <section className="system-hero" aria-labelledby="system-title">
        <p className="system-eyebrow"><span className="system-status-dot" /> TRUSTTAG · A BETTER WAY TO BUY</p>
        <h1 id="system-title">Trust, with proof.</h1>
        <p className="system-hero-copy">
          A high-value sale between strangers shouldn't depend on either one taking a leap of faith.
          The money stays locked until an independent handoff is confirmed.
        </p>
        <a className="system-text-link" href="#flow">See how it works <span aria-hidden="true">↓</span></a>
      </section>

      <figure className="handoff-image">
        <img
          src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=2200&q=85"
          alt="A carefully packed parcel ready to be handed over"
          fetchPriority="high"
        />
        <figcaption><span>THE PHYSICAL HANDOFF</span><span>One independent confirmation changes everything.</span></figcaption>
      </figure>

      <section className="roles-section" aria-labelledby="roles-title">
        <div className="system-section-heading">
          <p className="system-eyebrow">THREE PARTIES. ONE CLEAR RECORD.</p>
          <h2 id="roles-title">No one has to take<br />the other person's word.</h2>
        </div>
        <div className="role-grid">
          {roles.map((role) => (
            <article className="role-item" key={role.number}>
              <span className="system-index">{role.number}</span>
              <h3>{role.name}</h3>
              <p>{role.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flow-section" id="flow" aria-labelledby="flow-title">
        <PerspectiveFlow />
      </section>

      <section className="exceptions-section" aria-labelledby="exceptions-title">
        <div className="exceptions-intro">
          <p className="system-eyebrow">WHEN THINGS DON'T GO TO PLAN</p>
          <h2 id="exceptions-title">Fairness has<br />a second path.</h2>
        </div>
        <article className="exception-item">
          <span className="system-index">A · NO PICKUP</span>
          <h3>The buyer doesn't collect.</h3>
          <p>After the agreed window, around one to two weeks, the parcel is returned to the seller and escrow automatically refunds the buyer.</p>
        </article>
        <article className="exception-item">
          <span className="system-index">B · A DISPUTE</span>
          <h3>The item isn't as described.</h3>
          <p>A damage or authenticity claim pauses settlement. An independent reviewer considers evidence and decides whether funds go to the seller or back to the buyer.</p>
        </article>
      </section>

      <section className="fairness-section" id="why-fair" aria-labelledby="fairness-title">
        <p className="system-eyebrow">WHY IT'S FAIR TO BOTH SIDES</p>
        <h2 id="fairness-title">Proof replaces<br />the trust fall.</h2>
        <div className="fairness-grid">
          <p><span>For sellers</span>No payment release without evidence the item reached its new owner.</p>
          <p><span>For buyers</span>No false non-delivery claim after the post office confirms collection.</p>
          <p><span>For everyone</span>Neither party can withdraw, redirect, or hold the escrow on their own.</p>
        </div>
      </section>

      <section className="trust-layer-section" aria-labelledby="trust-layers-title">
        <div className="flow-heading">
          <div>
            <p className="system-eyebrow">WHY SOLANA IS HERE</p>
            <h2 id="trust-layers-title">More than a payment rail.</h2>
          </div>
          <p>A shared trust layer for the identity, history, and settlement of a physical item.</p>
        </div>
        <div className="trust-layer-grid">
          {trustLayers.map((layer) => (
            <article className="trust-layer" key={layer.number}>
              <span className="system-index">{layer.number}</span>
              <h3>{layer.title}</h3>
              <p>{layer.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="next-section" aria-labelledby="next-title">
        <div className="next-heading">
          <p className="system-eyebrow">DESIGNED FOR WHAT COMES NEXT</p>
          <h2 id="next-title">More proof.<br />Fewer weak links.</h2>
          <p className="next-disclosure">These are proposed safeguards, not features of the current demo.</p>
        </div>
        <div className="next-list">
          <article>
            <span>01</span>
            <div><h3>Courier attestations</h3><p>A delivery oracle such as Switchboard could bring carrier events on-chain. A proposed 48-hour review window would let a buyer raise an issue before release.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>Physical item authentication</h3><p>Tamper-resistant NFC with a physically unclonable signature could strengthen the link between a digital record and the real object beyond a QR code alone.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><h3>Seller collateral</h3><p>A seller stake could create a consequence for proven fraud, with an independent dispute decision routing compensation to the buyer.</p></div>
          </article>
        </div>
      </section>

      <aside className="demo-disclosure">
        <span className="system-status-dot" />
        <p><strong>Where the demo is today</strong> The current prototype demonstrates seller verification, item provenance, and a mocked atomic purchase flow. Post-office attestations, escrow arbitration, and the safeguards above are part of the proposed system design.</p>
      </aside>

      <footer className="system-footer">
        <a className="wordmark" href="/">TrustTag</a>
        <span>Objects worth keeping. Stories worth knowing.</span>
        <a href="/">Back to marketplace <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  )
}