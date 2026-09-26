type TxStatusProps = {
  label?: string
  detail?: string
}

export const TxStatus = ({
  label = "Processing transaction",
  detail = "Payment and ownership transfer in progress…",
}: TxStatusProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="space-y-2"
    >
      <p className="text-xl font-medium">{label}</p>
      <p className="text-neutral-600">{detail}</p>
    </div>
  )
}
