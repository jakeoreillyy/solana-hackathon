/**
 * Thin facade: React UI → clean Proven API → Solana (or mocks).
 * Components should import from here, not from package internals.
 */
import { ownership } from "@proven/ownership"
import { provenance } from "@proven/provenance"
import { settlement } from "@proven/settlement"
import type { OwnershipApi, ProvenanceApi, SettlementApi } from "@proven/shared"
import {
  mockOwnership,
  mockProvenance,
  mockSettlement,
} from "./mock"

const useMocks = () => {
  if (typeof process === "undefined") {
    return true
  }
  return process.env.NEXT_PUBLIC_USE_MOCKS !== "false"
}

export const isMockMode = () => useMocks()

export const getOwnership = (): OwnershipApi =>
  useMocks() ? mockOwnership : ownership

export const getSettlement = (): SettlementApi =>
  useMocks() ? mockSettlement : settlement

export const getProvenance = (): ProvenanceApi =>
  useMocks() ? mockProvenance : provenance

export const proven = {
  ownership: getOwnership,
  settlement: getSettlement,
  provenance: getProvenance,
  isMockMode,
}
