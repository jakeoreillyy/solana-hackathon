import QRCode from "qrcode"

const DEFAULT_BASE_URL = "http://localhost:3000"

/** Base URL the QR points at (NEXT_PUBLIC_APP_URL, no trailing slash). */
export const appBaseUrl = () => (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_BASE_URL).replace(/\/+$/, "")

/** The URL a QR for this item encodes. Throws on empty/blank IDs. */
export function itemUrl(itemId: string): string {
  const id = itemId?.trim()
  if (!id) throw new Error("itemId must be a non-empty string")
  return `${appBaseUrl()}/item/${encodeURIComponent(id)}`
}

/** QR image for an item as a `data:image/png;base64,…` URL. Pure JS, no chain dependency. */
export async function qrFor(itemId: string): Promise<string> {
  return QRCode.toDataURL(itemUrl(itemId), { errorCorrectionLevel: "M", margin: 2, width: 512 })
}
