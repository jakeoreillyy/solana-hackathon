import type { Item } from "@proven/shared"
import { VerifiedBadge } from "./VerifiedBadge"

type ItemCardProps = {
  item: Item
}

export const ItemCard = ({ item }: ItemCardProps) => {
  return (
    <article className="space-y-10" aria-label={`${item.name} listing`}>
      <header className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">{item.name}</h1>
        </div>
        {item.sellerVerified ? (
          <div className="flex justify-center">
            <VerifiedBadge />
          </div>
        ) : null}
        <p className="text-[#6E6E73] max-w-md mx-auto">{item.description}</p>
        <p className="text-3xl font-semibold tracking-tight pt-2">
          ${item.priceUsd.toLocaleString()}
        </p>
      </header>

      <div className="rounded-2xl bg-[#F5F5F7] p-6">
        <dl className="grid gap-3 text-sm">
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

      <section aria-label="Provenance history">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Provenance</h2>
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