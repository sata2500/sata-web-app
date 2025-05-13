// src/app/arama/page.tsx
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { SearchResults } from '@/components/search/search-results';
import { SearchBar } from '@/components/search/search-bar';

export const metadata = {
  title: 'Arama Sonuçları - SaTA',
  description: 'SaTA platformunda arama yapın ve içerikleri keşfedin.',
};

// Next.js 15 formatına uygun şekilde searchParams tipini Promise olarak tanımlıyoruz
interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Promise'i await ile çözümleme
  const resolvedParams = await searchParams;
  
  // Sorgu parametresini işle (dizi ise ilk elemanı al, yoksa boş string kullan)
  const query = typeof resolvedParams.q === 'string' 
    ? resolvedParams.q 
    : Array.isArray(resolvedParams.q) && resolvedParams.q.length > 0 
      ? resolvedParams.q[0] 
      : '';
  
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6">Arama Sonuçları</h1>
      
      {/* Arama çubuğu */}
      <div className="mb-8">
        <SearchBar fullWidth placeholder="Yeni bir arama yapın..." />
      </div>
      
      {query ? (
        <Suspense fallback={<div className="text-center py-10">Sonuçlar yükleniyor...</div>}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-foreground/60">Arama yapmak için yukarıdaki kutuyu kullanın.</p>
        </Card>
      )}
    </Container>
  );
}