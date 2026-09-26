import { describe, it, expect } from "vitest";
import { CLUSTER } from "@proven/shared";
describe("smoke", () => { it("uses devnet", () => expect(CLUSTER).toBe("devnet")); });
