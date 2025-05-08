// src/components/seo/schema-markup.tsx

'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { BlogPost } from '@/types/blog';
import { siteConfig } from '@/app/metadata';

interface SchemaMarkupProps {
  type: 'website' | 'blog' | 'blogPost' | 'organization';
  data?: any;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type, data }) => {
  const pathname = usePathname();
  const url = `${siteConfig.url}${pathname}`;

  let schema: any = null;

  switch (type) {
    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url,
        name: siteConfig.name,
        description: siteConfig.description,
      };
      break;

    case 'blog':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        url,
        name: `${siteConfig.name} Blog`,
        description: data?.description || 'Blog yazıları ve makaleler',
      };
      break;

    case 'blogPost':
      const post = data as BlogPost;
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: new Date(post.publishedAt).toISOString(),
        dateModified: new Date(post.updatedAt).toISOString(),
        image: post.coverImage || siteConfig.ogImage,
        author: {
          '@type': 'Person',
          name: post.author.name,
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/images/logo.svg`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
        keywords: post.tags.join(', '),
      };
      break;

    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        logo: `${siteConfig.url}/images/logo.svg`,
        sameAs: [
          siteConfig.links.github,
          siteConfig.links.twitter,
        ],
      };
      break;
  }

  if (!schema) return null;

  return (
    <Script
      id={`schema-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};