// src/components/recommendations/personalized-recommendations.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecommendationSection } from './recommendation-section';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { generateRecommendationsForUser } from '@/lib/recommendation-service';

interface PersonalizedRecommendationsProps {
  className?: string;
}

export function PersonalizedRecommendations({ className }: PersonalizedRecommendationsProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    // Sayfa yüklendiğinde önerileri otomatik olarak oluştur
    const autoGenerateRecommendations = async () => {
      if (!user) return;
      
      try {
        await generateRecommendationsForUser(user.id);
      } catch (error) {
        console.error('Öneriler otomatik oluşturulurken hata:', error);
      }
    };
    
    if (user) {
      autoGenerateRecommendations();
    }
  }, [user]);
  
  const handleRefresh = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    
    try {
      await generateRecommendationsForUser(user.id);
      router.refresh(); // Sayfayı yenile
    } catch (error) {
      console.error('Öneriler yenilenirken hata:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (loading) {
    return null;
  }
  
  if (!user) {
    return (
      <div className={`bg-primary/5 rounded-lg p-6 text-center ${className}`}>
        <h3 className="text-xl font-bold mb-2">Kişiselleştirilmiş Öneriler</h3>
        <p className="mb-4">Kişiselleştirilmiş öneriler almak için giriş yapın.</p>
        <Button onClick={() => router.push('/giris')}>Giriş Yap</Button>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <RecommendationSection title="Sizin İçin Öneriler" />
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isGenerating}
          className="ml-4"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yenileniyor...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Önerileri Yenile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}