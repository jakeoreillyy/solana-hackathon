"use client"

import { useEffect, useState } from "react"
import type { Item } from "@proven/shared"
import { SellerDashboard } from "@/components/SellerDashboard"
import { SiteHeader } from "@/components/SiteHeader"
import { getMockListings, MOCK_SELLER_WALLET, mockListings } from "@/lib/mock"

type Category = "watches" | "bags" | "cameras" | "guitars" | "jewelry" | "other"
type Filter = "all" | Category
type MarketMode = "buyer" | "seller"

const categoryById: Record<string, Category> = {
	"PROVEN-001": "watches",
	"PROVEN-002": "cameras",
	"PROVEN-003": "bags",
	"PROVEN-004": "guitars",
}

const categoryNames: Record<Category, string> = {
	watches: "Watches",
	bags: "Bags",
	cameras: "Cameras",
	guitars: "Guitars",
	jewelry: "Jewelry",
	other: "Other",
}

const makerById: Record<string, string> = {
	"PROVEN-001": "Rolex",
	"PROVEN-002": "Leica",
	"PROVEN-003": "Hermes",
	"PROVEN-004": "Gibson",
}

const titleById: Record<string, string> = {
	"PROVEN-001": "Submariner",
	"PROVEN-002": "M11 Rangefinder",
	"PROVEN-003": "Kelly 28",
	"PROVEN-004": "Custom 1959 Les Paul",
}

const listingsFor = (items: Item[]) =>
	items.map((item) => {
		const category =
			item.category && item.category in categoryNames
				? (item.category as Category)
				: categoryById[item.id] ?? "other"
		return {
			item,
			category,
			maker: makerById[item.id] ?? "SELLER LISTING",
			title: titleById[item.id] ?? item.name,
		}
	})

export default function Home() {
	const [filter, setFilter] = useState<Filter>("all")
	const [query, setQuery] = useState("")
	const [mode, setMode] = useState<MarketMode>("buyer")
	const [catalog, setCatalog] = useState(mockListings)

	useEffect(() => {
		setCatalog(getMockListings())
		if (new URLSearchParams(window.location.search).get("mode") === "seller") {
			setMode("seller")
		}
	}, [])

	const listings = listingsFor(catalog)
	const featured = listings.find(({ item }) => item.id === "PROVEN-001") ?? listings[0]

	const matchingListings = listings.filter(({ item, category, maker }) =>
		(filter === "all" || filter === category) &&
		`${item.name} ${maker} ${categoryNames[category]}`
			.toLowerCase()
			.includes(query.trim().toLowerCase()),
	)

	return (
		<main className="marketplace">
			<SiteHeader activePage="marketplace" mode={mode} />

			{mode === "buyer" ? (
			<>
			<section className="feature" aria-labelledby="feature-title">
				<div className="feature-copy">
					<p className="eyebrow"><span className="live-dot" /> THE VERIFIED EDIT · 001</p>
					<h1 id="feature-title">Good things<br />come around.</h1>
					<p className="feature-description">
						Exceptional pieces, with a history you can actually trust.
					</p>
					<a className="button-primary" href={`/item/${featured.item.id}`}>
						Discover the Submariner <span aria-hidden="true">↗</span>
					</a>
					<p className="feature-note">One considered find. Fully verified.</p>
				</div>
				<div className="feature-image-wrap">
					<img
						className="feature-image"
								src={featured.item.imageUrl}
								alt={featured.item.name}
						fetchPriority="high"
					/>
					<span className="image-index">01 / 01</span>
				</div>
				<a className="feature-product" href={`/item/${featured.item.id}`}>
					<span>{featured.maker} · {featured.title}</span>
					<span>${featured.item.priceUsd.toLocaleString()} <span aria-hidden="true">↗</span></span>
				</a>
			</section>

			<section className="browse-section" id="browse" aria-labelledby="browse-title">
				<div className="section-heading">
					<div>
						<p className="eyebrow">A SMALL, VERY GOOD PLACE TO START</p>
						<h2 id="browse-title">The marketplace</h2>
					</div>
					<label className="search-control">
						<span className="search-mark" aria-hidden="true" />
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search pieces"
							aria-label="Search pieces"
						/>
					</label>
				</div>

				<div className="browse-toolbar">
					<div className="filter-list" role="group" aria-label="Filter listings">
						{([
							["all", "All pieces"],
							["watches", "Watches"],
							["bags", "Bags"],
							["cameras", "Cameras"],
							["guitars", "Guitars"],
							["jewelry", "Jewelry"],
							["other", "Other"],
						] as const).map(([key, label]) => (
							<button
								className={`filter-button${filter === key ? " selected" : ""}`}
								key={key}
								onClick={() => setFilter(key)}
								type="button"
								aria-pressed={filter === key}
							>
								{label}
							</button>
						))}
					</div>
					<span className="result-count">{matchingListings.length} pieces</span>
				</div>

				{matchingListings.length ? (
					<div className="listing-grid">
						{matchingListings.map(({ item, maker, title, category }, index) => (
							<a
								className="listing-card"
								href={`/item/${item.id}`}
								key={item.id}
								style={{ animationDelay: `${index * 70}ms` }}
							>
								<div className="listing-image-wrap">
									<img src={item.imageUrl} alt={`${maker} ${title}`} loading="lazy" />
									<span className={`listing-tag${item.sellerVerified ? "" : " pending"}`}>
										<span className="live-dot" /> {item.sellerVerified ? "VERIFIED" : "VERIFYING"}
									</span>
									<span className="listing-open" aria-hidden="true">↗</span>
								</div>
								<div className="listing-info">
									<div>
										<p className="listing-maker">{maker} · {categoryNames[category]}</p>
										<h3>{title}</h3>
										<p className="listing-condition">
											{item.status === "AVAILABLE" ? "Ownership history recorded" : item.status === "PENDING" ? "Payment in escrow" : "Sold"}
										</p>
									</div>
									<p className="listing-price">${item.priceUsd.toLocaleString()}</p>
								</div>
							</a>
						))}
					</div>
				) : (
					<div className="empty-state">
						<span className="empty-mark" aria-hidden="true">⌕</span>
						<p>No pieces match that search.</p>
						<button type="button" onClick={() => { setQuery(""); setFilter("all") }}>
							Clear filters
						</button>
					</div>
				)}
			</section>

			<section className="trust-strip" id="trust" aria-label="TrustTag standards">
				<div className="trust-intro">
					<p className="eyebrow">A BETTER WAY TO BUY PRE-LOVED</p>
					<h2>History is part<br />of the value.</h2>
				</div>
				<div className="trust-detail" id="how-it-works">
					<span className="trust-number">01</span>
					<h3>Seller verified</h3>
					<p>Every listed seller is checked before their piece goes live.</p>
				</div>
				<div className="trust-detail">
					<span className="trust-number">02</span>
					<h3>Ownership, on record</h3>
					<p>A transparent provenance trail travels with every item.</p>
				</div>
				<div className="trust-detail">
					<span className="trust-number">03</span>
					<h3>Protected checkout</h3>
					<p>Payment and ownership transfer happen together.</p>
				</div>
			</section>
			</>
			) : (
				<SellerDashboard
					items={catalog.filter((item) => item.sellerWallet === MOCK_SELLER_WALLET)}
					onPublished={(item) => setCatalog((current) => [item, ...current.filter((existing) => existing.id !== item.id)])}
				/>
			)}

			<footer className="site-footer">
				<a className="wordmark" href="/">TrustTag</a>
				<span>Objects worth keeping. Stories worth knowing.</span>
				<span className="network-status"><span className="live-dot" /> SOLANA DEVNET</span>
			</footer>
		</main>
	)
}
