

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
      return [];
  },

  images: {
    remotePatterns: [
      // پروDUCTION
      { protocol: 'https', hostname: 'nerkhin.com', pathname: '/uploads/**' },
      // DEV (اگر تصاویر را از بک‌اند لوکال می‌گیرید)
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
    ],
  },
};

module.exports = nextConfig;
