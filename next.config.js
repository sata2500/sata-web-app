// next.config.js
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
    clientInstrumentationHook: true,
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  // Node.js runtime kullanımını etkinleştir
  // Ana nesne seviyesinde belirlenir
  runtime: 'nodejs',
  // Firebase Admin SDK'nın daha iyi çalışması için transpilePackages
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