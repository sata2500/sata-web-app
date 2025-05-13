// src/app/arama/page.tsx
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { SearchResults } from '@/components/search/search-results';
import { SearchBar } from '@/components/search/search-bar';

interface SearchPageProps {
  searchParams: { q?: string };
}

export const metadata = {
  title: 'Arama Sonuçları - SaTA',
  description: 'SaTA platformunda arama yapın ve içerikleri keşfedin.',
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  
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