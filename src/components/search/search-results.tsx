// src/components/search/search-results.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { search, SearchResult } from '@/lib/search-service';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const searchResults = await search(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Arama hatası:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (query) {
      fetchResults();
    } else {
      setResults([]);
      setIsLoading(false);
    }
  }, [query]);
  
  // Tipe göre sonuçları filtrele
  const getFilteredResults = (type: string): SearchResult[] => {
    if (type === 'all') return results;
    return results.filter(result => result.type === type);
  };
  
  // Sonuç sayılarını hesapla
  const blogCount = results.filter(r => r.type === 'blog').length;
  const categoryCount = results.filter(r => r.type === 'category').length;
  const tagCount = results.filter(r => r.type === 'tag').length;
  
  if (isLoading) {
    return <div className="text-center py-10">Arama sonuçları yükleniyor...</div>;
  }
  
  if (results.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground/60">
          &quot;{query}&quot; için sonuç bulunamadı. Farklı anahtar kelimelerle tekrar deneyin.
        </p>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <p className="text-foreground/60">
          &quot;{query}&quot; için toplam {results.length} sonuç bulundu.
        </p>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            Tümü ({results.length})
          </TabsTrigger>
          {blogCount > 0 && (
            <TabsTrigger value="blog">
              Blog ({blogCount})
            </TabsTrigger>
          )}
          {categoryCount > 0 && (
            <TabsTrigger value="category">
              Kategoriler ({categoryCount})
            </TabsTrigger>
          )}
          {tagCount > 0 && (
            <TabsTrigger value="tag">
              Etiketler ({tagCount})
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="space-y-4">
            {getFilteredResults(activeTab).map(result => (
              <SearchResultItem key={`${result.type}-${result.id}`} result={result} query={query} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
}

function SearchResultItem({ result, query }: SearchResultItemProps) {
  // Başlık ve açıklamada aranan kelimeyi vurgula
  const highlightMatch = (text: string): React.ReactNode => {
    if (!text) return <>{''}</>;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => (
          regex.test(part) ? (
            <mark key={i} className="bg-primary/20 text-foreground font-medium px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </>
    );
  };
  
  // İçerik tipine göre ikon
  const getTypeIcon = (): React.ReactNode => {
    switch (result.type) {
      case 'blog':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5a2 2 0 00-2 2v12a2 2 0 002 2h5z"
            />
          </svg>
        );
      case 'category':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
      case 'tag':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        );
      case 'user':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return <></>;
    }
  };
  
  // Türü Türkçe olarak göster
  const getTypeLabel = (): string => {
    switch (result.type) {
      case 'blog': return 'Blog';
      case 'category': return 'Kategori';
      case 'tag': return 'Etiket';
      case 'user': return 'Kullanıcı';
      default: return '';
    }
  };
  
  return (
    <Link href={result.url}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          {/* Resim varsa göster */}
          {result.image && (
            <div className="hidden sm:block w-24 h-24 md:w-32 md:h-32 relative shrink-0">
              <Image 
                src={result.image} 
                alt={result.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-4 flex-1">
            <div className="flex items-center text-xs text-foreground/60 mb-2">
              <span className="flex items-center mr-2">
                {getTypeIcon()}
                <span className="ml-1">{getTypeLabel()}</span>
              </span>
              
              {result.date && (
                <span>
                  {new Date(result.date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
            
            <h2 className="text-lg font-semibold mb-2">
              {highlightMatch(result.title)}
            </h2>
            
            {result.description && (
              <p className="text-sm text-foreground/80 line-clamp-2">
                {highlightMatch(result.description)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}