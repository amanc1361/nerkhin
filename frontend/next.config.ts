

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
      { protocol: 'https', hostname: 'nerrkhin.com', pathname: '/uploads/**'},
      // DEV (اگر تصاویر را از بک‌اند لوکال می‌گیرید)
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/uploads/**' },
      { protocol: "http", hostname: "localhost", port: "8080", pathname: "/uploads/**" },

      // مسیر جدید: لوگوی ساماندهی (برای <Image/>)
      { protocol: "https", hostname: "logo.samandehi.ir", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
