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
    <article className="space-y-4" aria-label={`${item.name} listing`}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{item.name}</h1>
          <VerifiedBadge status={status} />
        </div>
        <p className="text-neutral-600">{item.description}</p>
      </header>

      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-neutral-500">Serial / item identity</dt>
          <dd className="font-mono">{item.serialNumber}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Status</dt>
          <dd>{item.status}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Price</dt>
          <dd>
            ${item.priceUsd.toLocaleString()} ({item.priceLamports} lamports)
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Seller wallet</dt>
          <dd className="break-all font-mono text-xs">{item.sellerWallet}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Current on-chain owner</dt>
          <dd className="break-all font-mono text-xs">{item.ownerWallet}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Asset address</dt>
          <dd className="break-all font-mono text-xs">{item.assetAddress}</dd>
        </div>
      </dl>

      <section aria-label="Provenance history">
        <h2 className="mb-2 text-lg font-medium">Provenance</h2>
        {item.history.length === 0 ? (
          <p className="text-sm text-neutral-500">No history yet.</p>
        ) : (
          <ol className="space-y-2 border-l border-neutral-300 pl-4">
            {item.history.map((entry) => (
              <li key={`${entry.signature}-${entry.at}`} className="text-sm">
                <p className="font-mono text-xs break-all">{entry.owner}</p>
                <p className="text-neutral-500">{new Date(entry.at).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  )
}
