import type { Item } from "@proven/shared"
import { VerifiedBadge, type SellerStatus } from "./VerifiedBadge"

type ItemCardProps = {
  item: Item
  /** Live seller check; falls back to item.sellerVerified when omitted. */
  sellerStatus?: SellerStatus
}

export const ItemCard = ({ item, sellerStatus }: ItemCardProps) => {
  const status: SellerStatus = sellerStatus ?? (item.sellerVerified ? "verified" : "unverified")
  return (
    <article className="product-detail" aria-label={`${item.name} listing`}>
      <img
        src={item.imageUrl}
        alt={item.name}
        className="product-detail-image"
      />
      <header className="product-detail-header">
        <h1 className="product-detail-title">{item.name}</h1>
        <VerifiedBadge status={status} />
        <p className="product-detail-description">{item.description}</p>
      </header>

      <div className="product-record">
        <div className="product-record-heading">
          <h2>Item record</h2>
          <span>ON-CHAIN</span>
        </div>
        <dl>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Serial / item identity</dt>
            <dd className="font-mono text-[#1D1D1F]">{item.serialNumber}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Status</dt>
            <dd>{item.status}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Price in lamports</dt>
            <dd className="font-mono">{item.priceLamports}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Seller wallet</dt>
            <dd className="break-all font-mono text-xs text-right">{item.sellerWallet}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Current on-chain owner</dt>
            <dd className="break-all font-mono text-xs text-right">{item.ownerWallet}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[#6E6E73]">Asset address</dt>
            <dd className="break-all font-mono text-xs text-right">{item.assetAddress}</dd>
          </div>
        </dl>
      </div>

      <section className="provenance-history" aria-label="Provenance history">
        <h2>Ownership history</h2>
        {item.history.length === 0 ? (
          <p className="text-sm text-[#6E6E73]">No history yet.</p>
        ) : (
          <ol className="space-y-4 border-l border-[#D2D2D7] pl-4">
            {item.history.map((entry) => (
              <li key={`${entry.signature}-${entry.at}`} className="text-sm">
                <p className="break-all font-mono text-xs text-[#1D1D1F]">{entry.owner}</p>
                <p className="text-[#6E6E73]">{new Date(entry.at).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  )
}