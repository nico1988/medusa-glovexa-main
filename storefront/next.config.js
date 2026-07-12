const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

// Allow next/image to load product images served from the Medusa backend
// (its public HTTPS domain in production). Derived from the backend URL so we
// don't hardcode the host.
const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const backendImagePattern = (() => {
  if (!backendUrl) return []
  try {
    const u = new URL(backendUrl)
    return [{ protocol: u.protocol.replace(":", ""), hostname: u.hostname }]
  } catch {
    return []
  }
})()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // A broken lint rule can crash `next build`; linting runs separately via
    // `pnpm lint`, so don't let it block production builds.
    ignoreDuringBuilds: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Konva ships a Node build that requires the optional native `canvas` package;
  // the editor is client-only, so stub it out to keep the bundle resolving.
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...backendImagePattern,
    ],
  },
}

module.exports = nextConfig
