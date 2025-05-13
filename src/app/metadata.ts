// src/app/metadata.ts

import { Metadata } from 'next';

// Temel site meta verileri
export const siteConfig = {
  name: 'SaTA',
  description: 'Modern Web Geliştirme ve Öğrenme Platformu',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sata.com',
  ogImage: '/images/og-image.jpg',
  links: {
    github: 'https://github.com/sata-project',
    twitter: 'https://twitter.com/sata_project',
    linkedin: 'https://linkedin.com/company/sata-project',
  },
};

// Meta veri oluşturma yardımcı fonksiyonu
export function createMetadata({
  title,
  description,
  path = '',
  ogImage,
  noIndex = false,
  type = 'website', // type parametresini ekliyoruz (article veya website)
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string | null;
  noIndex?: boolean;
  type?: 'website' | 'article'; // İçerik türünü belirtmek için
}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const ogImageUrl = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${siteConfig.url}${ogImage}`
    : `${siteConfig.url}${siteConfig.ogImage}`;

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
      type, // 'website' veya 'article' olabilir
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

// Site bilgilerini al - Schema.org için kullanılabilir
export function getSiteInfo() {
  return {
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.svg`,
    socialProfiles: [
      siteConfig.links.twitter,
      siteConfig.links.github,
      siteConfig.links.linkedin,
    ],
  };
}