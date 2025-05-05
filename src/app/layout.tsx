import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

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

export const metadata: Metadata = {
  title: 'SaTA - Modern Blog ve Öğrenme Platformu',
  description: 'SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur.',
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