// src/app/onerilenim/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RecommendationCard } from '@/components/recommendations/recommendation-card';
import { useAuth } from '@/context/auth-context';
import { 
  getUserRecommendationsWithContent, 
  generateRecommendationsForUser, 
  getUserInterestPreferences,
  getAllTagsForRecommendations,
  saveUserInterestPreferences
} from '@/lib/recommendation-service';
import { RecommendationView, RecommendationFilter, RecommendationReason } from '@/types/recommendation';

// Suspense içerisinde kullanılacak içerik bileşeni
function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { user, loading } = useAuth();
  
  const initialTab = searchParams?.get('tab') || 'all';
  
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [recommendations, setRecommendations] = useState<RecommendationView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // İlgi alanları için
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !user) {
      router.push('/giris?redirect=/onerilenim');
    }
  }, [user, loading, router]);
  
  // Önerileri yükle
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const filter: RecommendationFilter = {};
        
        // Tab'a göre filtrele
        if (activeTab !== 'all') {
          filter.reason = activeTab as RecommendationReason;
        }
        
        const recs = await getUserRecommendationsWithContent(user.id, filter);
        setRecommendations(recs);
      } catch (error) {
        console.error('Öneriler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      loadRecommendations();
    }
  }, [user, activeTab]);
  
  // İlgi alanları için tüm etiketleri yükle
  useEffect(() => {
    const loadTags = async () => {
      if (!user) return;
      
      try {
        const tags = await getAllTagsForRecommendations();
        setAllTags(tags);
        
        // Kullanıcının mevcut tercihlerini yükle
        const preferences = await getUserInterestPreferences(user.id);
        
        if (preferences) {
          setSelectedCategories(preferences.categories);
          setSelectedTags(preferences.tags);
        }
      } catch (error) {
        console.error('Etiketler yüklenirken hata:', error);
      }
    };
    
    if (user) {
      loadTags();
    }
  }, [user]);
  
  // Önerileri yenile
  const handleRefreshRecommendations = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    
    try {
      await generateRecommendationsForUser(user.id);
      
      // Aktif sekmeyi yeniden yükle
      const filter: RecommendationFilter = {};
      if (activeTab !== 'all') {
        filter.reason = activeTab as RecommendationReason;
      }
      
      const recs = await getUserRecommendationsWithContent(user.id, filter);
      setRecommendations(recs);
    } catch (error) {
      console.error('Öneriler yenilenirken hata:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // İlgi alanlarını kaydet
  const handleSaveInterests = async () => {
    if (!user) return;
    
    try {
      await saveUserInterestPreferences(
        user.id,
        selectedCategories,
        selectedTags
      );
      
      setIsEditingInterests(false);
      
      // Önerileri yenile
      await handleRefreshRecommendations();
    } catch (error) {
      console.error('İlgi alanları kaydedilirken hata:', error);
    }
  };
  
  // Kategori seçimini değiştir
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Etiket seçimini değiştir
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Öneri etkileşimlerini yönet
  const handleRecommendationInteract = (recommendationId: string) => {
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
  };
  
  // Kullanıcı giriş yapmadıysa yükleme göster
  if (loading || !user) {
    return (
      <Container>
        <div className="py-12 text-center">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </Container>
    );
  }
  
  // İlgi alanları düzenleme arayüzünü oluştur
  const renderInterestsEditor = () => (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">İlgi Alanlarınızı Düzenleyin</h3>
        <Button variant="outline" onClick={() => setIsEditingInterests(false)}>
          İptal
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Kategoriler</h4>
          <div className="flex flex-wrap gap-2">
            {/* Burada normalde kategorileri listeleriz, şimdilik örnek olarak */}
            {['Teknoloji', 'Yazılım', 'Tasarım', 'Eğitim', 'Sağlık'].map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategories.includes(category)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Etiketler</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveInterests}>
            İlgi Alanlarını Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <Container>
      <div className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Size Özel Öneriler</h1>
          
          <div className="flex gap-3">
            <Button 
              variant={isEditingInterests ? "primary" : "outline"}
              onClick={() => setIsEditingInterests(!isEditingInterests)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              İlgi Alanlarım
            </Button>
            
            <Button 
              onClick={handleRefreshRecommendations}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        
        {isEditingInterests && renderInterestsEditor()}
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="interest">İlgi Alanlarınız</TabsTrigger>
            <TabsTrigger value="similar">Benzer İçerikler</TabsTrigger>
            <TabsTrigger value="following">Takip Ettikleriniz</TabsTrigger>
            <TabsTrigger value="popular">Popüler</TabsTrigger>
            <TabsTrigger value="trending">Gündemde</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-video bg-secondary/20 rounded-lg mb-4"></div>
                    <div className="h-6 bg-secondary/20 rounded mb-2"></div>
                    <div className="h-4 bg-secondary/20 rounded w-2/3 mb-2"></div>
                    <div className="h-10 bg-secondary/20 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 bg-primary/5 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1} 
                  stroke="currentColor" 
                  className="w-12 h-12 mx-auto mb-4 text-primary/50"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <h2 className="text-xl font-medium mb-2">
                  Henüz Öneri Bulunmuyor
                </h2>
                <p className="text-foreground/70 max-w-md mx-auto mb-6">
                  {activeTab === 'interest' 
                    ? "İlgi alanlarınıza göre öneriler için lütfen ilgi alanlarınızı belirleyin ve önerileri yenileyin."
                    : activeTab === 'following'
                    ? "Takip ettiğiniz kişilerden henüz içerik önerisi bulunmuyor. Yeni kişileri takip etmeyi deneyin."
                    : "Şu anda bu kategoride öneri bulunmuyor. Önerileri yenileyebilir veya başka bir kategoriye bakabilirsiniz."}
                </p>
                <Button onClick={handleRefreshRecommendations} disabled={isGenerating}>
                  {isGenerating ? "Yenileniyor..." : "Önerileri Yenile"}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map(recommendation => (
                  <RecommendationCard 
                    key={recommendation.id}
                    recommendation={recommendation}
                    onInteract={handleRecommendationInteract}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}

// Ana sayfa bileşeni - useSearchParams sorunları için Suspense ile sarılmış
export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <Container>
        <div className="py-12 text-center">
          <div className="animate-pulse">Yükleniyor...</div>
        </div>
      </Container>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}