// next.config.ts
import type { NextConfig } from "next";

// Deployment için next.config.js kullanılacaktır
// Bu dosya sadece yedekleme ve tip kontrolü amaçlıdır
const nextConfig: NextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
  },
  // Tip kontrolü için TypeScript'in bildiği temel özellikler 
  // Aktif yapılandırma için next.config.js kullanılacaktır
};

export default nextConfig;