// src/app/robots.ts
import { MetadataRoute } from 'next';

// Site URL'sini tanımla
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sata.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/giris/', '/kaydol/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}