import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

// Next only reads env files from apps/web; our single source of truth is the repo-root .env.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) })

export default {
  transpilePackages: ["@proven/shared", "@proven/ownership", "@proven/settlement", "@proven/provenance"],
  webpack: (config, { isServer }) => {
    // attestSeller (server-only, uses fs) is guarded at runtime; keep it out of the browser bundle.
    if (!isServer) config.resolve.fallback = { ...config.resolve.fallback, fs: false }
    return config
  },
}
