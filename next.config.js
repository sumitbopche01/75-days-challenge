/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development to reduce warnings
  register: true,
  skipWaiting: true,
  // Additional PWA options:
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/75days\.harinext\.com\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'app-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/wqzlhfmjhpfxkabgnqwi\.supabase\.co\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }
      }
    }
  ]
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    webpackBuildWorker: true, // Enable webpack build worker for better performance
  },
}

module.exports = withPWA(nextConfig) 