import type { ProvenanceApi } from "@proven/shared"
import { isVerified } from "./verify"
import { qrFor } from "./qr"

export { isVerified, clearVerifiedCache } from "./verify"
export { qrFor, itemUrl } from "./qr"

export const provenance: ProvenanceApi = {
  // Server-only: guarded so Next.js doesn't try to bundle `fs` for the browser.
  async attestSeller(wallet) {
    if (typeof window !== "undefined") {
      throw new Error("attestSeller is server-only — call it from a script or API route")
    }
    const { attestSeller } = await import("./attest")
    return attestSeller(wallet)
  },
  isVerified: (wallet) => isVerified(wallet),
  verifySeller: (wallet) => isVerified(wallet),
  qrFor,
}
