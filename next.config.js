const million = require('million/compiler')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}
module.exports = million.next(nextConfig)
