// src/lib/recommendation-service.ts
import { 
  // getDocument kullanılmıyor, kaldırıldı
  setDocument, 
  updateDocument, 
  queryCollection,
  deleteDocument
} from '@/lib/firebase-service';
import { 
  Recommendation, 
  RecommendationReason, 
  UserInterest,
  ContentSimilarity,
  RecommendationView,
  RecommendationFilter,
  UserInterestPreference
} from '@/types/recommendation';
import { BlogPost } from '@/types/blog';
import { generateId } from '@/lib/utils';
import { 
  getUserLikes,
  getUserSaves,
  getInteractionStats
} from '@/lib/interaction-service';
import {
  getBlogPostById,
  getBlogPosts,
  getBlogTags,
  getCategoryById
} from '@/lib/blog-service';
import { getFollowing } from '@/lib/follow-service';
// UserProfile kullanılmıyor, kaldırıldı

// Koleksiyon adları
const RECOMMENDATION_COLLECTION = 'recommendations';
const USER_INTEREST_COLLECTION = 'user_interests';
const CONTENT_SIMILARITY_COLLECTION = 'content_similarities';
const USER_INTEREST_PREF_COLLECTION = 'user_interest_preferences';

// Öneri oluşturma
export async function createRecommendation(recommendation: Omit<Recommendation, 'id' | 'timestamp'>): Promise<string> {
  try {
    const id = generateId(20);
    const timestamp = Date.now();
    
    const newRecommendation: Recommendation = {
      ...recommendation,
      id,
      timestamp
    };
    
    await setDocument(RECOMMENDATION_COLLECTION, id, newRecommendation);
    return id;
  } catch (error) {
    console.error('Öneri oluşturulurken hata:', error);
    throw error;
  }
}

// Kullanıcının önerilerini getirme
export async function getUserRecommendations(
  userId: string,
  filter?: RecommendationFilter
): Promise<Recommendation[]> {
  try {
    const conditions = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'viewed', operator: '==', value: false }
    ];
    
    // Eğer neden filtresi varsa ekle
    if (filter?.reason) {
      conditions.push({ field: 'reason', operator: '==', value: filter.reason });
    }
    
    const result = await queryCollection<Recommendation>({
      collectionPath: RECOMMENDATION_COLLECTION,
      conditions,
      orderByField: 'score',
      orderDirection: 'desc',
      limitCount: filter?.limit || 20
    });
    
    return result.data;
  } catch (error) {
    console.error('Kullanıcı önerileri getirilirken hata:', error);
    return [];
  }
}

// Kullanıcının önerilerini görsellerle birlikte getirme (UI için)
export async function getUserRecommendationsWithContent(
  userId: string,
  filter?: RecommendationFilter
): Promise<RecommendationView[]> {
  try {
    // Önerileri getir
    const recommendations = await getUserRecommendations(userId, filter);
    
    // Blog yazılarını getir
    const recommendationViewsPromises = recommendations
      .filter(rec => rec.contentType === 'blog_post')
      .map(async (recommendation) => {
        const content = await getBlogPostById(recommendation.contentId);
        
        if (!content) {
          return null;
        }
        
        // İnsan dostu neden metni oluştur
        const reasonText = getReasonText(recommendation.reason);
        
        return {
          id: recommendation.id as string,
          content,
          reason: recommendation.reason,
          reasonText,
          score: recommendation.score
        };
      });
    
    const recommendationViews = await Promise.all(recommendationViewsPromises);
    
    // null değerleri filtrele
    return recommendationViews.filter((view): view is RecommendationView => view !== null);
  } catch (error) {
    console.error('Öneri görünümleri getirilirken hata:', error);
    return [];
  }
}

// Neden metnini oluşturma
function getReasonText(reason: RecommendationReason): string {
  switch (reason) {
    case 'interest':
      return 'İlgi alanlarınıza göre';
    case 'similar':
      return 'Okuduklarınıza benzer';
    case 'popular':
      return 'Popüler içerik';
    case 'following':
      return 'Takip ettiklerinizden';
    case 'trending':
      return 'Gündemde';
    default:
      return 'Sizin için seçtiklerimiz';
  }
}

// Öneriyi "görüntülendi" olarak işaretleme
export async function markRecommendationAsViewed(recommendationId: string): Promise<void> {
  try {
    await updateDocument(RECOMMENDATION_COLLECTION, recommendationId, {
      viewed: true
    });
  } catch (error) {
    console.error('Öneri görüntülendi olarak işaretlenirken hata:', error);
  }
}

// Öneriyi "etkileşimde bulunuldu" olarak işaretleme
export async function markRecommendationAsInteracted(recommendationId: string): Promise<void> {
  try {
    await updateDocument(RECOMMENDATION_COLLECTION, recommendationId, {
      interacted: true
    });
  } catch (error) {
    console.error('Öneri etkileşimde bulunuldu olarak işaretlenirken hata:', error);
  }
}

// Kullanıcı ilgi alanı ekleme/güncelleme
export async function setUserInterest(
  userId: string,
  category: string,
  tags: string[],
  weight: number,
  source: 'explicit' | 'implicit'
): Promise<string> {
  try {
    // Önce mevcut ilgi alanını kontrol et
    const existingInterests = await queryCollection<UserInterest>({
      collectionPath: USER_INTEREST_COLLECTION,
      conditions: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'category', operator: '==', value: category }
      ],
      limitCount: 1
    });
    
    const timestamp = Date.now();
    
    if (existingInterests.data.length > 0) {
      // Mevcut ilgi alanını güncelle
      const existingInterest = existingInterests.data[0];
      await updateDocument(USER_INTEREST_COLLECTION, existingInterest.id as string, {
        tags,
        weight,
        source,
        timestamp
      });
      
      return existingInterest.id as string;
    } else {
      // Yeni ilgi alanı ekle
      const id = generateId(20);
      
      const newInterest: UserInterest = {
        id,
        userId,
        category,
        tags,
        weight,
        source,
        timestamp
      };
      
      await setDocument(USER_INTEREST_COLLECTION, id, newInterest);
      return id;
    }
  } catch (error) {
    console.error('Kullanıcı ilgi alanı ayarlanırken hata:', error);
    throw error;
  }
}

// Kullanıcı ilgi alanlarını getirme
export async function getUserInterests(userId: string): Promise<UserInterest[]> {
  try {
    const result = await queryCollection<UserInterest>({
      collectionPath: USER_INTEREST_COLLECTION,
      conditions: [{ field: 'userId', operator: '==', value: userId }],
      orderByField: 'weight',
      orderDirection: 'desc'
    });
    
    return result.data;
  } catch (error) {
    console.error('Kullanıcı ilgi alanları getirilirken hata:', error);
    return [];
  }
}

// Benzer içerik ekleme
export async function addSimilarContent(
  contentId: string,
  similarContentId: string,
  score: number
): Promise<void> {
  try {
    const id = `${contentId}_${similarContentId}`;
    
    const similarity: ContentSimilarity = {
      contentId,
      similarContentId,
      score
    };
    
    await setDocument(CONTENT_SIMILARITY_COLLECTION, id, similarity);
  } catch (error) {
    console.error('Benzer içerik eklenirken hata:', error);
    throw error;
  }
}

// Belirli bir içeriğe benzer içerikleri getirme
export async function getSimilarContent(contentId: string, limit = 5): Promise<BlogPost[]> {
  try {
    // Benzerlik ilişkilerini getir
    const result = await queryCollection<ContentSimilarity>({
      collectionPath: CONTENT_SIMILARITY_COLLECTION,
      conditions: [{ field: 'contentId', operator: '==', value: contentId }],
      orderByField: 'score',
      orderDirection: 'desc',
      limitCount: limit
    });
    
    // Benzer içeriklerin ID'lerini al
    const similarContentIds = result.data.map(similarity => similarity.similarContentId);
    
    // İçerikleri getir
    const contentPromises = similarContentIds.map(id => getBlogPostById(id));
    const contents = await Promise.all(contentPromises);
    
    // null değerleri ve yayınlanmamış içerikleri filtrele
    return contents
      .filter((content): content is BlogPost => !!content)
      .filter(content => content.status === 'published');
  } catch (error) {
    console.error('Benzer içerikler getirilirken hata:', error);
    return [];
  }
}

// İçerik benzerliği hesaplama ve güncelleme (periyodik çalışan bir fonksiyon)
export async function updateContentSimilarities(): Promise<void> {
  try {
    // Tüm blog yazılarını getir
    const { posts } = await getBlogPosts({ perPage: 100 });
    
    // Her yazı için diğer yazılarla benzerliği hesapla
    for (const post of posts) {
      for (const otherPost of posts) {
        // Kendisiyle karşılaştırma
        if (post.id === otherPost.id) continue;
        
        // Benzerlik skorunu hesapla (basit bir implementasyon)
        const similarityScore = calculateSimilarity(post, otherPost);
        
        // Eğer yeterince benzerse kaydet
        if (similarityScore > 0.3) {
          await addSimilarContent(post.id as string, otherPost.id as string, similarityScore);
        }
      }
    }
  } catch (error) {
    console.error('İçerik benzerlikleri güncellenirken hata:', error);
  }
}

// İki içerik arasındaki benzerliği hesaplama
function calculateSimilarity(post1: BlogPost, post2: BlogPost): number {
  let score = 0;
  
  // Kategori aynıysa
  if (post1.categoryId && post2.categoryId && post1.categoryId === post2.categoryId) {
    score += 0.3;
  }
  
  // Ortak etiketleri hesapla
  const commonTags = post1.tags.filter(tag => post2.tags.includes(tag));
  score += commonTags.length * 0.1;
  
  // Başlık ve özet benzerliği (basit implementasyon)
  const title1Words = post1.title.toLowerCase().split(' ');
  const title2Words = post2.title.toLowerCase().split(' ');
  const commonTitleWords = title1Words.filter(word => title2Words.includes(word));
  score += commonTitleWords.length * 0.05;
  
  // Skor 0-1 arasında olmalı
  return Math.min(1, score);
}

// Kullanıcı davranışlarına göre önerileri oluşturma
export async function generateRecommendationsForUser(userId: string): Promise<number> {
  try {
    // Kullanıcının mevcut önerilerini temizle (isteğe bağlı)
    await clearUserRecommendations(userId);
    
    // 1. Kullanıcının ilgi alanlarına göre öneriler
    const interestRecommendations = await generateInterestBasedRecommendations(userId);
    
    // 2. Benzer içerik önerileri
    const similarRecommendations = await generateSimilarContentRecommendations(userId);
    
    // 3. Takip edilenlerden öneriler
    const followingRecommendations = await generateFollowingRecommendations(userId);
    
    // 4. Popüler içerik önerileri
    const popularRecommendations = await generatePopularRecommendations(userId);
    
    // 5. Trend içerik önerileri
    const trendingRecommendations = await generateTrendingRecommendations(userId);
    
    // Toplam öneri sayısını döndür
    return interestRecommendations + similarRecommendations + 
           followingRecommendations + popularRecommendations + 
           trendingRecommendations;
  } catch (error) {
    console.error('Kullanıcı için öneriler oluşturulurken hata:', error);
    return 0;
  }
}

// Kullanıcının önerilerini temizleme
async function clearUserRecommendations(userId: string): Promise<void> {
  try {
    // Kullanıcının mevcut önerilerini getir
    const result = await queryCollection<Recommendation>({
      collectionPath: RECOMMENDATION_COLLECTION,
      conditions: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'viewed', operator: '==', value: false }
      ],
      limitCount: 100
    });
    
    // Önerileri sil
    const deletePromises = result.data.map(recommendation => 
      deleteDocument(RECOMMENDATION_COLLECTION, recommendation.id as string)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Kullanıcı önerileri temizlenirken hata:', error);
  }
}

// Kullanıcının ilgi alanlarına göre öneriler oluşturma
async function generateInterestBasedRecommendations(userId: string): Promise<number> {
  try {
    // Kullanıcının ilgi alanlarını getir
    const interests = await getUserInterests(userId);
    
    if (interests.length === 0) {
      return 0; // İlgi alanı yoksa öneri de yok
    }
    
    // Kullanıcının beğendiği ve kaydettiği içerikleri getir (filtreleme için)
    const likedContentIds = await getUserLikes(userId, 'blog_post');
    const savedContentIds = await getUserSaves(userId, 'blog_post');
    const excludedContentIds = [...likedContentIds, ...savedContentIds];
    
    let recommendationCount = 0;
    
    // Her ilgi alanı için içerik bul
    for (const interest of interests) {
      // Kategori ve etiketlere göre içerik getir
      const query: Record<string, unknown> = { perPage: 10 };
      
      if (interest.category !== 'all') {
        // Kategori ID'sini al (eğer ilgi alanı bir kategori ID'si ise)
        const category = await getCategoryById(interest.category);
        if (category) {
          query.categoryId = category.id;
        }
      }
      
      const { posts } = await getBlogPosts(query);
      
      // Etiketlere göre filtrele
      let filteredPosts = posts;
      if (interest.tags.length > 0) {
        filteredPosts = posts.filter(post => 
          post.tags.some(tag => interest.tags.includes(tag))
        );
      }
      
      // Zaten görüntülenmiş içerikleri filtrele
      filteredPosts = filteredPosts.filter(post => 
        !excludedContentIds.includes(post.id as string)
      );
      
      // En fazla 5 öneri ekle
      for (const post of filteredPosts.slice(0, 5)) {
        // Öneri skoru hesapla (ağırlık ve diğer faktörlere göre)
        const score = Math.round(interest.weight * 100);
        
        // Öneriyi ekle
        await createRecommendation({
          userId,
          contentId: post.id as string,
          contentType: 'blog_post',
          score,
          reason: 'interest',
          viewed: false,
          interacted: false
        });
        
        recommendationCount++;
      }
    }
    
    return recommendationCount;
  } catch (error) {
    console.error('İlgi alanı bazlı öneriler oluşturulurken hata:', error);
    return 0;
  }
}

// Benzer içerik önerileri oluşturma
async function generateSimilarContentRecommendations(userId: string): Promise<number> {
  try {
    // Kullanıcının beğendiği ve kaydettiği içerikleri getir
    const likedContentIds = await getUserLikes(userId, 'blog_post');
    const savedContentIds = await getUserSaves(userId, 'blog_post');
    const viewedContentIds = [...likedContentIds, ...savedContentIds];
    
    if (viewedContentIds.length === 0) {
      return 0; // Görüntülenen içerik yoksa öneri de yok
    }
    
    let recommendationCount = 0;
    
    // Her görüntülenen içerik için benzer içerikleri bul
    for (const contentId of viewedContentIds.slice(0, 10)) { // En son 10 içerik
      const similarContents = await getSimilarContent(contentId, 3); // Her içerik için en fazla 3 benzer içerik
      
      // Zaten önerilmiş veya görüntülenmiş içerikleri filtrele
      const filteredContents = similarContents.filter(content => 
        !viewedContentIds.includes(content.id as string)
      );
      
      // Önerileri ekle
      for (const content of filteredContents) {
        // Benzerlik skoruna göre öneri skoru hesapla
        const score = 80; // Varsayılan yüksek bir skor
        
        await createRecommendation({
          userId,
          contentId: content.id as string,
          contentType: 'blog_post',
          score,
          reason: 'similar',
          viewed: false,
          interacted: false
        });
        
        recommendationCount++;
      }
    }
    
    return recommendationCount;
  } catch (error) {
    console.error('Benzer içerik önerileri oluşturulurken hata:', error);
    return 0;
  }
}

// Takip edilenlerden öneriler oluşturma
async function generateFollowingRecommendations(userId: string): Promise<number> {
  try {
    // Kullanıcının takip ettiği kullanıcıları getir
    const followingUsers = await getFollowing(userId);
    
    if (followingUsers.length === 0) {
      return 0; // Takip edilen kullanıcı yoksa öneri de yok
    }
    
    // Kullanıcının görüntülediği içerikleri getir (filtreleme için)
    const likedContentIds = await getUserLikes(userId, 'blog_post');
    const savedContentIds = await getUserSaves(userId, 'blog_post');
    const viewedContentIds = [...likedContentIds, ...savedContentIds];
    
    let recommendationCount = 0;
    
    // Her takip edilen kullanıcı için en son içeriklerini getir
    for (const followedUser of followingUsers) {
      // TODO: Bu kısım author.id şeklinde olmalı, ama şu anda blog servisi böyle değil
      // Şimdilik basit bir filtre uygulayalım
      const { posts } = await getBlogPosts({ 
        status: 'published',
        perPage: 5
      });
      
      // Takip edilen kullanıcıya ait içerikleri filtrele (örnek)
      const followedUserPosts = posts.filter(post => 
        post.author && post.author.id === followedUser.id
      );
      
      // Zaten görüntülenmiş içerikleri filtrele
      const filteredPosts = followedUserPosts.filter(post => 
        !viewedContentIds.includes(post.id as string)
      );
      
      // Önerileri ekle
      for (const post of filteredPosts) {
        const score = 85; // Takip edilenlerden gelen içerikler önemli
        
        await createRecommendation({
          userId,
          contentId: post.id as string,
          contentType: 'blog_post',
          score,
          reason: 'following',
          viewed: false,
          interacted: false
        });
        
        recommendationCount++;
      }
    }
    
    return recommendationCount;
  } catch (error) {
    console.error('Takip edilen önerileri oluşturulurken hata:', error);
    return 0;
  }
}

// Popüler içerik önerileri oluşturma
async function generatePopularRecommendations(userId: string): Promise<number> {
  try {
    // Kullanıcının görüntülediği içerikleri getir (filtreleme için)
    const likedContentIds = await getUserLikes(userId, 'blog_post');
    const savedContentIds = await getUserSaves(userId, 'blog_post');
    const viewedContentIds = [...likedContentIds, ...savedContentIds];
    
    // En popüler blog yazılarını getir (en çok beğenilen, kaydedilen, görüntülenen)
    const { posts } = await getBlogPosts({
      status: 'published',
      perPage: 50
    });
    
    // Her içerik için popülerlik skorunu hesapla
    const postsWithPopularity = await Promise.all(
      posts.map(async (post) => {
        const stats = await getInteractionStats(post.id as string, 'blog_post');
        const popularityScore = (stats.likeCount * 3) + (stats.saveCount * 2) + stats.viewCount;
        return { post, popularityScore };
      })
    );
    
    // Popülerliğe göre sırala
    postsWithPopularity.sort((a, b) => b.popularityScore - a.popularityScore);
    
    // En popüler 10 içeriği al
    const popularPosts = postsWithPopularity.slice(0, 10).map(item => item.post);
    
    // Zaten görüntülenmiş içerikleri filtrele
    const filteredPosts = popularPosts.filter(post => 
      !viewedContentIds.includes(post.id as string)
    );
    
    let recommendationCount = 0;
    
    // Önerileri ekle
    for (const post of filteredPosts) {
      const score = 70; // Popüler içerikler için orta seviye skor
      
      await createRecommendation({
        userId,
        contentId: post.id as string,
        contentType: 'blog_post',
        score,
        reason: 'popular',
        viewed: false,
        interacted: false
      });
      
      recommendationCount++;
    }
    
    return recommendationCount;
  } catch (error) {
    console.error('Popüler içerik önerileri oluşturulurken hata:', error);
    return 0;
  }
}

// Trend içerik önerileri oluşturma (son 7 günde popülerlik artışı olanlar)
async function generateTrendingRecommendations(userId: string): Promise<number> {
  try {
    // Şimdilik basitleştirilmiş bir implementasyon:
    // Son 7 günde yayınlanan içerikler arasında en popüler olanları getir
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Kullanıcının görüntülediği içerikleri getir (filtreleme için)
    const likedContentIds = await getUserLikes(userId, 'blog_post');
    const savedContentIds = await getUserSaves(userId, 'blog_post');
    const viewedContentIds = [...likedContentIds, ...savedContentIds];
    
    // Son bir haftada yayınlanan blog yazılarını getir
    const { posts } = await getBlogPosts({
      status: 'published',
      perPage: 50
    });
    
    // Son bir haftada yayınlananları filtrele
    const recentPosts = posts.filter(post => post.publishedAt >= oneWeekAgo);
    
    // Her içerik için popülerlik skorunu hesapla
    const postsWithPopularity = await Promise.all(
      recentPosts.map(async (post) => {
        const stats = await getInteractionStats(post.id as string, 'blog_post');
        const popularityScore = (stats.likeCount * 3) + (stats.saveCount * 2) + stats.viewCount;
        
        // Daha yeni içeriklere bonus ver
        const daysOld = (Date.now() - post.publishedAt) / (24 * 60 * 60 * 1000);
        const recencyBonus = Math.max(0, 7 - daysOld) * 5;
        
        return { post, trendScore: popularityScore + recencyBonus };
      })
    );
    
    // Trend skoruna göre sırala
    postsWithPopularity.sort((a, b) => b.trendScore - a.trendScore);
    
    // En trend 5 içeriği al
    const trendingPosts = postsWithPopularity.slice(0, 5).map(item => item.post);
    
    // Zaten görüntülenmiş içerikleri filtrele
    const filteredPosts = trendingPosts.filter(post => 
      !viewedContentIds.includes(post.id as string)
    );
    
    let recommendationCount = 0;
    
    // Önerileri ekle
    for (const post of filteredPosts) {
      const score = 75; // Trend içerikler için yüksek-orta seviye skor
      
      await createRecommendation({
        userId,
        contentId: post.id as string,
        contentType: 'blog_post',
        score,
        reason: 'trending',
        viewed: false,
        interacted: false
      });
      
      recommendationCount++;
    }
    
    return recommendationCount;
  } catch (error) {
    console.error('Trend içerik önerileri oluşturulurken hata:', error);
    return 0;
  }
}

// Kullanıcı ilgi alanı tercihlerini kaydetme (kullanıcının açıkça belirttiği)
export async function saveUserInterestPreferences(
  userId: string,
  categories: string[],
  tags: string[],
  excludedTags: string[] = []
): Promise<void> {
  try {
    const preference: UserInterestPreference = {
      userId,
      categories,
      tags,
      excludedTags,
      updatedAt: Date.now()
    };
    
    // Mevcut tercihleri kontrol et
    const result = await queryCollection<UserInterestPreference>({
      collectionPath: USER_INTEREST_PREF_COLLECTION,
      conditions: [{ field: 'userId', operator: '==', value: userId }],
      limitCount: 1
    });
    
    if (result.data.length > 0) {
      // Güncelle
      await updateDocument(USER_INTEREST_PREF_COLLECTION, result.data[0].id as string, preference);
    } else {
      // Yeni oluştur
      await setDocument(USER_INTEREST_PREF_COLLECTION, userId, preference);
    }
    
    // İlgi alanları oluştur
    for (const category of categories) {
      await setUserInterest(userId, category, [], 0.8, 'explicit');
    }
    
    // Etiketleri de ilgi alanı olarak ekle
    if (tags.length > 0) {
      await setUserInterest(userId, 'tags', tags, 0.9, 'explicit');
    }
    
    // Önerileri yeniden oluştur
    await generateRecommendationsForUser(userId);
  } catch (error) {
    console.error('Kullanıcı ilgi alanı tercihleri kaydedilirken hata:', error);
    throw error;
  }
}

// Kullanıcı ilgi alanı tercihlerini getirme
export async function getUserInterestPreferences(userId: string): Promise<UserInterestPreference | null> {
  try {
    const result = await queryCollection<UserInterestPreference>({
      collectionPath: USER_INTEREST_PREF_COLLECTION,
      conditions: [{ field: 'userId', operator: '==', value: userId }],
      limitCount: 1
    });
    
    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Kullanıcı ilgi alanı tercihleri getirilirken hata:', error);
    return null;
  }
}

// Tüm etiketleri öneriler için getirme
export async function getAllTagsForRecommendations(): Promise<string[]> {
  try {
    return await getBlogTags();
  } catch (error) {
    console.error('Tüm etiketler getirilirken hata:', error);
    return [];
  }
}