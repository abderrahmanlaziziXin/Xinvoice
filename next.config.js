/** @type {import('next').NextConfig} */
// Temporarily disable bundle analyzer
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['openai']
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Enable SWC minification
  swcMinify: true,
}

module.exports = nextConfig
