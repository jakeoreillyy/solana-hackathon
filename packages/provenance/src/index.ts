import type { ProvenanceApi } from "@proven/shared";
// TODO (P5): demo attestation (memo tx or attester-signed record), QR generation
export const provenance: ProvenanceApi = {
  async attestSeller() { throw new Error("not implemented"); },
  async isVerified() { throw new Error("not implemented"); },
  async qrFor() { throw new Error("not implemented"); },
};
