// src/components/seo/schema-markup.tsx
import React from 'react';

// BlogPost interface'ini type olarak değiştirdik
type BlogPost = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    id?: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id?: string;
    name: string;
    slug: string;
  };
  tags: string[];
  status: 'draft' | 'published';
  createdAt: number;
  updatedAt: number;
  publishedAt: number;
  viewCount: number;
  commentCount?: number;
  featured?: boolean;
};

// Breadcrumb öğe tip tanımı
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SchemaMarkupProps {
  type: 'blogPost' | 'website' | 'organization' | 'breadcrumb';
  data: BlogPost | BreadcrumbItem[] | Record<string, unknown>;
}

export function WebsiteSchema({ siteUrl, siteName }: { siteUrl: string, siteName: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/arama?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema({
  siteUrl,
  siteName,
  logo = '',
  socialProfiles = []
}: {
  siteUrl: string,
  siteName: string,
  logo?: string,
  socialProfiles?: string[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    url: siteUrl,
    name: siteName,
    ...(logo && { logo: logo }),
    ...(socialProfiles.length > 0 && { sameAs: socialProfiles })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items, siteUrl }: { items: BreadcrumbItem[], siteUrl: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
        name: item.name
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  let schema: Record<string, unknown> = {};

  switch (type) {
    case 'blogPost':
      const blogData = data as BlogPost;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blogData.title,
        description: blogData.excerpt || '',
        image: blogData.coverImage || '',
        datePublished: new Date(blogData.publishedAt).toISOString(),
        dateModified: new Date(blogData.updatedAt).toISOString(),
        author: {
          '@type': 'Person',
          name: blogData.author?.name || 'SaTA'
        },
        publisher: {
          '@type': 'Organization',
          name: 'SaTA',
          logo: {
            '@type': 'ImageObject',
            url: 'https://sata.com/images/logo.svg'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://sata.com/blog/${blogData.slug}`
        },
        keywords: blogData.tags.join(', ')
      };
      break;

    case 'breadcrumb':
      const breadcrumbData = data as BreadcrumbItem[];
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbData.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@id': item.url,
            name: item.name
          }
        }))
      };
      break;

    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SaTA',
        url: 'https://sata.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://sata.com/arama?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
      break;

    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SaTA',
        url: 'https://sata.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sata.com/images/logo.svg'
        }
      };
      break;

    default:
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Thing',
        name: 'SaTA',
        url: 'https://sata.com'
      };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}