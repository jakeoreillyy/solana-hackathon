import { Suspense } from "react"
import { ItemPageClient } from "./ItemPageClient"

type ItemPageProps = {
  params: Promise<{ id: string }>
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<main className="p-8">Loading item…</main>}>
      <ItemPageClient id={id} />
    </Suspense>
  )
}
