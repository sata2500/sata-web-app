// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog-service';

interface Route {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Site ana rota bilgileri
  const routes: Route[] = [
    {
      url: 'https://sata.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://sata.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://sata.com/hakkimizda',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://sata.com/iletisim',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Blog yazılarını al
  const result = await getBlogPosts({ 
    status: 'published', 
    perPage: 100 
  });

  // Blog yazılarını sitemap'e ekle
  const blogRoutes = result.posts.map((post) => ({
    url: `https://sata.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...routes, ...blogRoutes];
}