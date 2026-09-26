import type { ReactNode } from "react"

type Step = "browse" | "item" | "processing" | "success"

const STEPS: { key: Step; label: string }[] = [
  { key: "browse", label: "Browse marketplace" },
  { key: "item", label: "View item" },
  { key: "processing", label: "Processing" },
  { key: "success", label: "Complete" },
]

type AppShellProps = {
  children: ReactNode
  activeStep: Step
}

export const AppShell = ({ children, activeStep }: AppShellProps) => {
  const activeIndex = STEPS.findIndex((s) => s.key === activeStep)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#D2D2D7] bg-white/90 px-8 backdrop-blur">
        <a href="/" className="text-lg font-semibold tracking-tight">
          TrustTag
        </a>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-3 py-1 text-xs text-[#6E6E73]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1D8348]" />
          Devnet
        </span>
      </header>

      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden w-60 shrink-0 border-r border-[#D2D2D7] px-4 py-10 md:block">
          <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wide text-[#86868B]">
            Purchase flow
          </p>
          <ol className="space-y-1">
            {STEPS.map((step, i) => {
              const isActive = step.key === activeStep
              const isDone = i < activeIndex
              return (
                <li key={step.key}>
                  <div
                    className={
                      isActive
                        ? "flex items-center gap-3 rounded-lg bg-[#F5F5F7] px-3 py-2 text-sm font-medium text-[#1D1D1F]"
                        : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#86868B]"
                    }
                  >
                    <span
                      className={
                        isDone || isActive
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#0071E3] text-[10px] text-white"
                          : "flex h-5 w-5 items-center justify-center rounded-full border border-[#D2D2D7] text-[10px]"
                      }
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    {step.label}
                  </div>
                </li>
              )
            })}
          </ol>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-16 md:px-12">{children}</main>
      </div>
    </div>
  )
}