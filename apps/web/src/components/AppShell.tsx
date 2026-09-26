import type { ReactNode } from "react"
import { SiteHeader } from "./SiteHeader"

type Step = "browse" | "item" | "processing" | "success"

type AppShellProps = {
  children: ReactNode
  activeStep: Step
}

export const AppShell = ({ children, activeStep }: AppShellProps) => (
  <div className={`app-shell app-shell-${activeStep}`}>
    <SiteHeader activePage="marketplace" />
    <main className="purchase-main">{children}</main>
  </div>
)