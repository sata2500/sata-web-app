// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WebsiteSchema, OrganizationSchema } from '@/components/seo/schema-markup';

// Font tanımları
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans', 
  display: 'swap'
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading', 
  display: 'swap'
});

// Site bilgileri
const siteConfig = {
  name: 'SaTA',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sata.com',
  description: 'SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur.',
  logo: '/images/logo.svg',
  socialProfiles: {
    twitter: 'sataweb',
    github: 'sataweb',
    linkedin: 'company/sataweb'
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Modern Blog ve Öğrenme Platformu`,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: ['blog', 'eğitim', 'öğrenme', 'web', 'platform', 'SaTA'],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Modern Blog ve Öğrenme Platformu`,
    description: siteConfig.description,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Modern Blog ve Öğrenme Platformu`,
    description: siteConfig.description,
    images: ['/images/og-image.jpg'],
    creator: `@${siteConfig.socialProfiles.twitter}`
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
  },
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/'
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema değişikliğinde titreme önleme script'i */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Kaydedilen tema veya sistem teması tercihini kontrol et
                  const storedTheme = localStorage.getItem('theme');
                  
                  if (storedTheme === 'dark' || 
                      (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  // LocalStorage erişilemiyorsa varsayılan olarak light tema kullan
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        
        {/* Schema.org yapısal verileri */}
        <WebsiteSchema siteUrl={siteConfig.url} siteName={siteConfig.name} />
        <OrganizationSchema 
          siteUrl={siteConfig.url} 
          siteName={siteConfig.name} 
          logo={`${siteConfig.url}${siteConfig.logo}`}
          socialProfiles={[
            `https://twitter.com/${siteConfig.socialProfiles.twitter}`,
            `https://github.com/${siteConfig.socialProfiles.github}`,
            `https://www.linkedin.com/${siteConfig.socialProfiles.linkedin}`
          ]}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable}`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}