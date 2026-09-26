import { describe, it, expect } from "vitest"
import { CLUSTER, getExplorerUrl } from "@proven/shared"

describe("smoke", () => {
  it("uses devnet", () => {
    expect(CLUSTER).toBe("devnet")
  })

  it("builds explorer urls", () => {
    expect(getExplorerUrl("abc")).toContain("abc")
    expect(getExplorerUrl("abc")).toContain("devnet")
  })
})
