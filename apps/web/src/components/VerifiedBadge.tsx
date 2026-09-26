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
  const { label, text } = styles[status]
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-medium ${
        status === "verified" ? "text-[#1D8348]" : "text-[#6E6E73]"
      }`}
      aria-label={label}
      aria-busy={status === "loading"}
      tabIndex={0}
    >
      {text}
    </span>
  )
}