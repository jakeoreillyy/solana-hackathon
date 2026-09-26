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
      className="flex flex-col items-center text-center gap-6 py-12"
    >
      <div className="w-10 h-10 border-2 border-[#D2D2D7] border-t-[#0071E3] rounded-full animate-spin" />
      <div>
        <p className="text-2xl font-semibold tracking-tight">{label}</p>
        <p className="text-[#6E6E73] mt-2">{detail}</p>
      </div>
    </div>
  )
}