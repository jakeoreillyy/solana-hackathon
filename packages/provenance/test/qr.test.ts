import { describe, it, expect, afterEach } from "vitest"
import { PNG } from "pngjs"
import jsQR from "jsqr"
import { qrFor, itemUrl } from "../src/qr"

const decode = (dataUrl: string) => {
  const png = PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"))
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data
}

describe("qrFor", () => {
  const prev = process.env.NEXT_PUBLIC_APP_URL
  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_APP_URL
    else process.env.NEXT_PUBLIC_APP_URL = prev
  })

  it("returns a PNG data URL that decodes to the item URL (default base)", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    const qr = await qrFor("PROVEN-001")
    expect(qr.startsWith("data:image/png;base64,")).toBe(true)
    expect(decode(qr)).toBe("http://localhost:3000/item/PROVEN-001")
  })

  it("uses NEXT_PUBLIC_APP_URL and encodes the id", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://demo.example.com/"
    expect(itemUrl("a b/1")).toBe("https://demo.example.com/item/a%20b%2F1")
    expect(decode(await qrFor("PROVEN-001"))).toBe("https://demo.example.com/item/PROVEN-001")
  })

  it("rejects empty or blank ids", async () => {
    await expect(qrFor("")).rejects.toThrow(/non-empty/)
    await expect(qrFor("   ")).rejects.toThrow(/non-empty/)
    expect(() => itemUrl("")).toThrow(/non-empty/)
  })
})
