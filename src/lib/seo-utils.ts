// src/lib/seo-utils.ts
import { Metadata } from 'next';
import { BlogPost } from '@/types/blog';

const DEFAULT_SITE_NAME = 'SaTA';
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sata.com.tr';
const DEFAULT_DESCRIPTION = 'SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur.';
const DEFAULT_IMAGE = '/images/og-image.jpg';

// Sayfa başlığı oluşturur
export function formatPageTitle(title: string): string {
  return `${title} - ${DEFAULT_SITE_NAME}`;
}

// Blog yazısı metadata'sı oluşturur
export function getBlogPostMetadata(post: BlogPost): Metadata {
  const title = post.title;
  const description = post.excerpt || post.content.substring(0, 160);
  const url = `/blog/${post.slug}`;
  const imageUrl = post.coverImage || DEFAULT_IMAGE;
  
  return {
    title: formatPageTitle(title),
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      publishedTime: new Date(post.publishedAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      siteName: DEFAULT_SITE_NAME
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    },
    alternates: {
      canonical: `${DEFAULT_SITE_URL}${url}`
    }
  };
}

// Genel sayfa metadata'sı oluşturur
export function getPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}): Metadata {
  const fullTitle = formatPageTitle(title);
  const url = path ? `${DEFAULT_SITE_URL}${path}` : DEFAULT_SITE_URL;
  const imageUrl = image.startsWith('http') ? image : `${DEFAULT_SITE_URL}${image}`;
  
  return {
    title: fullTitle,
    description,
    openGraph: {
      type,
      title,
      description,
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      siteName: DEFAULT_SITE_NAME
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    },
    alternates: {
      canonical: url
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  };
}

// Yapısal veri için site bilgilerini al
export function getSiteInfo() {
  return {
    siteName: DEFAULT_SITE_NAME,
    siteUrl: DEFAULT_SITE_URL,
    logo: `${DEFAULT_SITE_URL}/images/logo.svg`,
    socialProfiles: [
      'https://twitter.com/sataweb',
      'https://github.com/sataweb',
      'https://www.linkedin.com/company/sataweb'
    ]
  };
}