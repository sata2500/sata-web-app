import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
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