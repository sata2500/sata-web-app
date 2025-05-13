/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
  },
  // nodeMiddleware yerine runtime='nodejs' kullanılacak
  // experimental bölümünü tamamen kaldırıyoruz
  transpilePackages: ['firebase-admin'],
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