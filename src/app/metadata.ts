// src/app/metadata.ts

import { Metadata } from 'next';

// Temel site meta verileri
export const siteConfig = {
  name: 'SaTA',
  description: 'Modern Web Geliştirme ve Öğrenme Platformu',
  url: 'https://sata.com',
  ogImage: 'https://sata.com/images/og-image.jpg',
  links: {
    github: 'https://github.com/sata-project',
    twitter: 'https://twitter.com/sata_project',
  },
};

// Meta veri oluşturma yardımcı fonksiyonu
export function createMetadata({
  title,
  description,
  path = '',
  ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string | null;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const ogImageUrl = ogImage || siteConfig.ogImage;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: ['blog', 'yazılım', 'web geliştirme', 'öğrenme', 'teknoloji'],
    authors: [{ name: 'SaTA Ekibi' }],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [ogImageUrl],
      creator: '@sata_project',
    },
  };
}