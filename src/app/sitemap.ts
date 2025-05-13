// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog-service';

interface Route {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Site URL'sini tanımla
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sata.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Site ana rota bilgileri
  const routes: Route[] = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/iletisim`,
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
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.featured ? 0.8 : 0.7,
  }));

  return [...routes, ...blogRoutes];
}