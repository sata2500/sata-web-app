// src/app/robots.ts

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/giris/', '/kaydol/'],
    },
    sitemap: 'https://sata.com/sitemap.xml',
  };
}