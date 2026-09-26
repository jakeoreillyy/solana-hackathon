import { AppShell } from "@/components/AppShell"
import { TxStatus } from "@/components/TxStatus"

type ProcessingPageProps = {
  searchParams: Promise<{ itemId?: string }>
}

export default async function Processing({ searchParams }: ProcessingPageProps) {
  const query = await searchParams

  return (
    <AppShell activeStep="processing">
      <div className="mx-auto max-w-lg">
        <TxStatus
          label="Processing purchase"
          detail={
            query.itemId
              ? `Settling payment and ownership for ${query.itemId}…`
              : "Settling payment and ownership on Solana…"
          }
        />
      </div>
    </AppShell>
  )
}