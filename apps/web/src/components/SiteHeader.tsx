type MarketMode = "buyer" | "seller"
type ActivePage = "marketplace" | "how-it-works" | "our-standard"

type SiteHeaderProps = {
  activePage?: ActivePage
  mode?: MarketMode
}

export const SiteHeader = ({ activePage, mode = "buyer" }: SiteHeaderProps) => (
  <header className="site-header">
    <a className="wordmark" href="/" aria-label="TrustTag home">TrustTag</a>
    <nav className="main-nav" aria-label="Main navigation">
      <a aria-current={activePage === "marketplace" ? "page" : undefined} className={activePage === "marketplace" ? "nav-active" : undefined} href="/#browse">Marketplace</a>
      <a aria-current={activePage === "how-it-works" ? "page" : undefined} className={activePage === "how-it-works" ? "nav-active" : undefined} href="/how-it-works">How it works</a>
      <a aria-current={activePage === "our-standard" ? "page" : undefined} className={activePage === "our-standard" ? "nav-active" : undefined} href="/our-standard">Our standard</a>
    </nav>
    <div className="market-header-actions">
      <nav className="market-mode-switch" aria-label="Account perspective">
        <a aria-current={mode === "buyer" ? "page" : undefined} className={mode === "buyer" ? "market-mode-button selected" : "market-mode-button"} href="/?mode=buyer">Buyer</a>
        <a aria-current={mode === "seller" ? "page" : undefined} className={mode === "seller" ? "market-mode-button selected" : "market-mode-button"} href="/?mode=seller">Seller</a>
      </nav>
      <a className="header-action" href={mode === "buyer" ? "/#browse" : "/?mode=seller#seller-form"}>
        {mode === "buyer" ? "Explore pieces" : "List an item"}<span aria-hidden="true">↗</span>
      </a>
    </div>
  </header>
)