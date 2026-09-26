import type { ProvenanceApi } from "@proven/shared"

// TODO (P5): demo attestation (memo tx or attester-signed record), QR generation
export const provenance: ProvenanceApi = {
  async attestSeller() {
    throw new Error("not implemented")
  },
  async isVerified() {
    throw new Error("not implemented")
  },
  async verifySeller(wallet: string) {
    return provenance.isVerified(wallet)
  },
  async qrFor() {
    throw new Error("not implemented")
  },
}
