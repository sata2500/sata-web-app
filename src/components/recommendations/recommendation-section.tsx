// src/components/recommendations/recommendation-section.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RecommendationCard } from './recommendation-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { getUserRecommendationsWithContent } from '@/lib/recommendation-service';
import { RecommendationView } from '@/types/recommendation';

interface RecommendationSectionProps {
  title?: string;
  showMoreLink?: boolean;
  limit?: number;
}

export function RecommendationSection({ 
  title = "Sizin İçin Öneriler", 
  showMoreLink = true,
  limit = 6
}: RecommendationSectionProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<{
    interest: RecommendationView[];
    similar: RecommendationView[];
    following: RecommendationView[];
    popular: RecommendationView[];
    trending: RecommendationView[];
  }>({
    interest: [],
    similar: [],
    following: [],
    popular: [],
    trending: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('interest');
  
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Her bir kategori için önerileri getir
        const interestRecs = await getUserRecommendationsWithContent(
          user.id, 
          { reason: 'interest', limit }
        );
        
        const similarRecs = await getUserRecommendationsWithContent(
          user.id, 
          { reason: 'similar', limit }
        );
        
        const followingRecs = await getUserRecommendationsWithContent(
          user.id, 
          { reason: 'following', limit }
        );
        
        const popularRecs = await getUserRecommendationsWithContent(
          user.id, 
          { reason: 'popular', limit }
        );
        
        const trendingRecs = await getUserRecommendationsWithContent(
          user.id, 
          { reason: 'trending', limit }
        );
        
        setRecommendations({
          interest: interestRecs,
          similar: similarRecs,
          following: followingRecs,
          popular: popularRecs,
          trending: trendingRecs
        });
        
        // İlk önceliği belirle (veri olan ilk sekme)
        if (interestRecs.length > 0) {
          setActiveTab('interest');
        } else if (similarRecs.length > 0) {
          setActiveTab('similar');
        } else if (followingRecs.length > 0) {
          setActiveTab('following');
        } else if (popularRecs.length > 0) {
          setActiveTab('popular');
        } else if (trendingRecs.length > 0) {
          setActiveTab('trending');
        }
      } catch (error) {
        console.error('Öneriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadRecommendations();
    }
  }, [user, limit]);
  
  const handleRecommendationInteract = (recommendationId: string) => {
    // İlgili öneriyi tüm listelerden kaldır
    setRecommendations(prev => {
      const newRecommendations = { ...prev };
      
      for (const key in newRecommendations) {
        if (Object.prototype.hasOwnProperty.call(newRecommendations, key)) {
          const typedKey = key as keyof typeof newRecommendations;
          newRecommendations[typedKey] = newRecommendations[typedKey].filter(
            rec => rec.id !== recommendationId
          );
        }
      }
      
      return newRecommendations;
    });
  };
  
  // Sekmeleri oluştur (sadece içerik olan sekmeleri göster)
  const tabs = [
    { id: 'interest', label: 'İlgi Alanlarınız', items: recommendations.interest },
    { id: 'similar', label: 'Benzer İçerikler', items: recommendations.similar },
    { id: 'following', label: 'Takip Ettikleriniz', items: recommendations.following },
    { id: 'popular', label: 'Popüler', items: recommendations.popular },
    { id: 'trending', label: 'Gündemde', items: recommendations.trending }
  ].filter(tab => tab.items.length > 0);
  
  // Kullanıcı yoksa veya hiç öneri yoksa
  if (!user || (tabs.length === 0 && !loading)) {
    return null;
  }
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video bg-secondary/20 rounded-lg mb-4"></div>
              <div className="h-6 bg-secondary/20 rounded mb-2"></div>
              <div className="h-4 bg-secondary/20 rounded w-2/3 mb-2"></div>
              <div className="h-10 bg-secondary/20 rounded mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {showMoreLink && (
          <Link href="/onerilenim" className="text-primary font-medium">
            Tüm Öneriler &rarr;
          </Link>
        )}
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tab.items.map(recommendation => (
                <RecommendationCard 
                  key={recommendation.id}
                  recommendation={recommendation}
                  onInteract={handleRecommendationInteract}
                />
              ))}
            </div>
            
            {showMoreLink && tab.items.length >= limit && (
              <div className="mt-8 text-center">
                <Button asChild variant="outline">
                  <Link href={`/onerilenim?tab=${tab.id}`}>
                    Daha Fazla {tab.label}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}