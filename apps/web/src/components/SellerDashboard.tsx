"use client"

import { useEffect, useState, type FormEvent } from "react"
import type { Item } from "@proven/shared"
import { getOwnership, getProvenance, isMockMode } from "@/lib/client"
import { MOCK_SELLER_WALLET } from "@/lib/mock"

type SellerDashboardProps = {
  items: Item[]
  onPublished: (item: Item) => void
}

const imageAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read this image"))
    reader.onerror = () => reject(new Error("Could not read this image"))
    reader.readAsDataURL(file)
  })

export const SellerDashboard = ({ items, onPublished }: SellerDashboardProps) => {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("watches")
  const [serialNumber, setSerialNumber] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    },
    [imagePreview],
  )

  const handleImageChange = (file: File | undefined) => {
    setError(null)
    setMessage(null)
    if (!file) {
      setImage(null)
      setImagePreview(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file to continue.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Images must be 2 MB or smaller.")
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setError(null)
    setMessage(null)
    if (!image) {
      setError("Add a photo of your item before publishing.")
      return
    }

    setIsPublishing(true)
    try {
      const priceUsd = Number(price)
      const id = `LISTING-${Date.now().toString(36).toUpperCase()}`
      const item = await getOwnership().registerItem({
        id,
        name: name.trim(),
        category,
        description: description.trim(),
        serialNumber: serialNumber.trim(),
        imageUrl: await imageAsDataUrl(image),
        priceUsd,
        priceLamports: String(Math.round(priceUsd * 5_000_000)),
        sellerWallet: MOCK_SELLER_WALLET,
      })
      await getProvenance().attestSeller(MOCK_SELLER_WALLET)
      const verifiedItem = await getOwnership().getItem(item.id)
      onPublished(verifiedItem)
      form.reset()
      setName("")
      setCategory("watches")
      setSerialNumber("")
      setDescription("")
      setPrice("")
      setImage(null)
      setImagePreview(null)
      setMessage("Your listing is live in the marketplace.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not publish this item.")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <section className="seller-view" aria-labelledby="seller-title">
      <div className="seller-intro">
        <p className="eyebrow"><span className="live-dot" /> SELLER STUDIO</p>
        <h1 id="seller-title">Your next sale,<br />with a little more trust.</h1>
        <p>List a considered piece. Your buyer's payment stays in escrow until an independent pickup confirmation.</p>
      </div>

      <div className="seller-dashboard-grid">
        <form className="seller-form" id="seller-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="seller-form-heading">
            <div>
              <p className="eyebrow">NEW LISTING</p>
              <h2>Tell us about your item</h2>
            </div>
            <span className="seller-secure-note">Seller verified</span>
          </div>

          <div className="seller-form-fields">
            <label className="seller-field seller-photo-field">
              <span>Item photo <span className="seller-required">Required</span></span>
              <span className={`seller-upload${imagePreview ? " has-image" : ""}`}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Selected item preview" />
                ) : (
                  <span className="seller-upload-prompt">
                    <span className="seller-upload-icon" aria-hidden="true">＋</span>
                    <span>Add a clear photo</span>
                    <small>JPG, PNG or WebP · up to 2 MB</small>
                  </span>
                )}
                <input
                  accept="image/*"
                  aria-label="Upload item photo"
                  onChange={(event) => handleImageChange(event.target.files?.[0])}
                  type="file"
                />
              </span>
            </label>

            <label className="seller-field">
              <span>Item name</span>
              <input autoComplete="off" maxLength={90} onChange={(event) => setName(event.target.value)} placeholder="e.g. Cartier Love Bracelet" required value={name} />
            </label>

            <div className="seller-field-row">
              <label className="seller-field">
                <span>Category</span>
                <select onChange={(event) => setCategory(event.target.value)} value={category}>
                  <option value="watches">Watches</option>
                  <option value="bags">Bags</option>
                  <option value="cameras">Cameras</option>
                  <option value="guitars">Guitars</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="seller-field">
                <span>Price · USD</span>
                <input min="1" onChange={(event) => setPrice(event.target.value)} placeholder="0" required step="1" type="number" value={price} />
              </label>
            </div>

            <label className="seller-field">
              <span>Serial or item identity</span>
              <input autoComplete="off" maxLength={80} onChange={(event) => setSerialNumber(event.target.value)} placeholder="Serial number or unique identifier" required value={serialNumber} />
            </label>

            <label className="seller-field">
              <span>About this piece</span>
              <textarea maxLength={500} onChange={(event) => setDescription(event.target.value)} placeholder="Condition, included accessories, and anything a buyer should know" required rows={3} value={description} />
            </label>
          </div>

          {error ? <p className="seller-form-message error" role="alert">{error}</p> : null}
          {message ? <p className="seller-form-message success" role="status">{message}</p> : null}
          {!isMockMode() ? <p className="seller-form-note">Publishing requires the live seller registration service.</p> : null}

          <button className="seller-submit" disabled={isPublishing} type="submit">
            {isPublishing ? "Publishing…" : "Publish listing"}<span aria-hidden="true">↗</span>
          </button>
        </form>

        <aside className="seller-listings" aria-labelledby="seller-listings-title">
          <div className="seller-listings-heading">
            <div>
              <p className="eyebrow">YOUR SHOP</p>
              <h2 id="seller-listings-title">Your listings <span>{items.length}</span></h2>
            </div>
          </div>
          {items.length ? (
            <div className="seller-listing-list">
              {items.map((item) => (
                <a className="seller-listing" href={`/item/${encodeURIComponent(item.id)}`} key={item.id}>
                  <img src={item.imageUrl} alt="" />
                  <span className="seller-listing-copy">
                    <strong>{item.name}</strong>
                    <small>${item.priceUsd.toLocaleString()} · {item.sellerVerified ? "LIVE" : "VERIFYING"}</small>
                  </span>
                  <span aria-hidden="true" className="seller-listing-arrow">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="seller-listings-empty">Your published pieces will appear here.</div>
          )}
          <p className="seller-listings-note">Payment is held in escrow and released after confirmed pickup.</p>
        </aside>
      </div>
    </section>
  )
}