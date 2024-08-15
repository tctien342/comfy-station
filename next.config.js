const million = require('million/compiler')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, nextRuntime, webpack }) => {
    /**
     * Fix for ts-morph warning
     */
    if (isServer && nextRuntime === 'nodejs') {
      config.plugins.push(new webpack.ContextReplacementPlugin(/ts-morph/))
    }
    return config
  },
  experimental: { instrumentationHook: true }
}
module.exports = million.next(nextConfig)
