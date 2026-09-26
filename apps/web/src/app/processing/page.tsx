import { TxStatus } from "@/components/TxStatus"

type ProcessingPageProps = {
  searchParams: Promise<{ itemId?: string }>
}

export default async function Processing({ searchParams }: ProcessingPageProps) {
  const query = await searchParams

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <TxStatus
        label="Processing purchase"
        detail={
          query.itemId
            ? `Settling payment and ownership for ${query.itemId}…`
            : "Settling payment and ownership on Solana…"
        }
      />
    </main>
  )
}
