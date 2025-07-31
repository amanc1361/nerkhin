

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
            source: '/api/go/:path*',
            destination: 'http://localhost:8084/v1/:path*',
        },
      ];
    }
    return [];
  },

  images: {
    remotePatterns: [
      // پروDUCTION
      { protocol: 'https', hostname: 'nerrkhin.com', pathname: '/images/**' },
      // DEV (اگر تصاویر را از بک‌اند لوکال می‌گیرید)
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/images/**' },
    ],
  },
};

module.exports = nextConfig;
