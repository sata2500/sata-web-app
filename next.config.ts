// next.config.ts
import type { NextConfig } from "next";

// Tam tip tanımı olmadığı için eslint-disable kullanıyoruz

const nextConfig: NextConfig = {
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
    middleware: {
      useNodeRuntime: true,
    },
  },
  transpilePackages: ['firebase-admin'],
  webpack: (config, { isServer }) => {
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

export default nextConfig;