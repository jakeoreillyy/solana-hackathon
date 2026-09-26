import { Suspense } from "react"
import { SuccessClient } from "./SuccessClient"

export default function Success() {
  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <SuccessClient />
    </Suspense>
  )
}
