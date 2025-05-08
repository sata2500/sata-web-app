import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    // Alternatif olarak, remotePatterns kullanabilirsiniz
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'firebasestorage.googleapis.com',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;