import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import dotenv from "dotenv"

// Next only reads env files from apps/web; our single source of truth is the repo-root .env.
const root = fileURLToPath(new URL("../../", import.meta.url))
dotenv.config({ path: resolve(root, ".env") })

// Server routes run with cwd = apps/web; anchor the demo keypair paths to the repo root.
for (const name of ["seller", "buyer", "attester"]) {
  const key = `${name.toUpperCase()}_KEYPAIR_PATH`
  process.env[key] = resolve(root, process.env[key] ?? `.keys/${name}.json`)
}
process.env.ITEMS_JSON_PATH = resolve(root, "apps/web/public/items.json")

export default {
  transpilePackages: ["@proven/shared", "@proven/ownership", "@proven/settlement", "@proven/provenance"],
  webpack: (config, { isServer }) => {
    // attestSeller (server-only, uses fs) is guarded at runtime; keep it out of the browser bundle.
    if (!isServer) config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, url: false }
    return config
  },
}
