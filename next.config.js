/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
  },
  experimental: {
    // Node.js Middleware desteği için
    nodeMiddleware: true,
  },
  transpilePackages: ['firebase-admin'],
  // webpack ayarlarını özelleştirme
  webpack: (config, { isServer }) => {
    // Node.js modüllerini daha iyi ele almak için
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;