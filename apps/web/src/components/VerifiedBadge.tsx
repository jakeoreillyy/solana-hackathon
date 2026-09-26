export type SellerStatus = "verified" | "unverified" | "loading"

type VerifiedBadgeProps = {
  status: SellerStatus
}

const styles: Record<SellerStatus, { className: string; label: string; text: string }> = {
  verified: {
    className: "border-emerald-600 text-emerald-700",
    label: "Verified seller",
    text: "✓ Seller verified",
  },
  unverified: {
    className: "border-neutral-400 text-neutral-500",
    label: "Seller not verified",
    text: "Not verified",
  },
  loading: {
    className: "border-neutral-300 text-neutral-400",
    label: "Checking seller verification",
    text: "Checking seller…",
  },
}

export const VerifiedBadge = ({ status }: VerifiedBadgeProps) => {
  const { className, label, text } = styles[status]
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${className}`}
      aria-label={label}
      aria-busy={status === "loading"}
      tabIndex={0}
    >
      {text}
    </span>
  )
}
