import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { HeroSlider } from '@/components/home/hero-slider';
import { FeaturedPosts } from '@/components/home/featured-posts';
import { AboutSection } from '@/components/home/about-section';
import { SchemaMarkup } from '@/components/seo/schema-markup';
import { createMetadata } from '@/app/metadata';

export const metadata: Metadata = createMetadata({
  title: 'Modern Blog ve Öğrenme Platformu',
  description: 'SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur.'
});

export default function HomePage() {
  return (
    <>
      <SchemaMarkup 
        type="website" 
        data={{
          name: 'SaTA',
          url: 'https://sata.com',
          description: 'SaTA, blog ve çeşitli uygulamalar sunan modern bir web platformudur.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://sata.com/arama?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }}
      />
      
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Öne Çıkan Blog Yazıları */}
      <Container>
        <div className="py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Öne Çıkan Yazılar</h2>
            <Link href="/blog" className="text-primary font-medium">
              Tüm Yazılar &rarr;
            </Link>
          </div>
          
          <FeaturedPosts />
        </div>
      </Container>
      
      {/* Hakkımızda Bölümü */}
      <div className="bg-primary/5 py-16">
        <Container>
          <AboutSection />
          
          <div className="mt-8 text-center">
            <Button href="/hakkimizda">
              Daha Fazla Bilgi
            </Button>
          </div>
        </Container>
      </div>
      
      {/* Yakında Gelecek Modüller */}
      <Container>
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Yakında Gelecek Modüller</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">SaTA-ÖYS</h3>
              <p className="text-foreground/70">Öğrenme yönetim sistemi ile eğitim içeriklerinizi kolayca oluşturun ve paylaşın.</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">SaTA-Müzik</h3>
              <p className="text-foreground/70">Müzik çalma listelerinizi oluşturun, paylaşın ve keşfedin.</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Seher AI</h3>
              <p className="text-foreground/70">Yapay zeka destekli içerik oluşturma ve analiz araçları.</p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}