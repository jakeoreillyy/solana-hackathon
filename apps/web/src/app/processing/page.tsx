import { Suspense } from "react"
import { AppShell } from "@/components/AppShell"
import { ProcessingClient } from "./ProcessingClient"

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <AppShell activeStep="processing">
          <p className="text-[#6E6E73]">Loading escrow status...</p>
        </AppShell>
      }
    >
      <ProcessingClient />
    </Suspense>
  )
}