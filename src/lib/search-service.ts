// src/lib/search-service.ts
import { getBlogPosts } from '@/lib/blog-service';
import { getUsers } from '@/lib/user-service';
// getCategories şimdilik kullanılmadığı için import kaldırıldı
import { BlogPost } from '@/types/blog';
import { UserProfile } from '@/types/user';

// Arama sonuçları türleri
export type SearchResultType = 'blog' | 'user' | 'category' | 'tag';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  url: string;
  image?: string;
  date?: number;
  relevance: number; // 0-100 arası alaka puanı
}

// Metinsel içerikte arama yapan yardımcı fonksiyon
function matchContent(content: string, query: string): boolean {
  return content.toLowerCase().includes(query.toLowerCase());
}

// Alaka puanı hesaplayan fonksiyon
// any yerine union tip kullanarak daha tip-güvenli hale getirdik
function calculateRelevance(item: BlogPost | UserProfile, query: string, type: SearchResultType): number {
  const lowerQuery = query.toLowerCase();
  let relevance = 0;
  
  // Tür bazında özel puanlama
  if (type === 'blog') {
    const post = item as BlogPost;
    // Başlıkta tam eşleşme - en yüksek puan
    if (post.title.toLowerCase() === lowerQuery) {
      relevance += 100;
    }
    // Başlık içinde geçiyorsa
    else if (matchContent(post.title, query)) {
      relevance += 80;
    }
    // İçerikte geçiyorsa
    if (matchContent(post.content, query)) {
      relevance += 50;
    }
    // Özette geçiyorsa
    if (post.excerpt && matchContent(post.excerpt, query)) {
      relevance += 60;
    }
    // Etiketlerde geçiyorsa
    if (post.tags && post.tags.some(tag => matchContent(tag, query))) {
      relevance += 70;
    }
  } 
  else if (type === 'user') {
    const user = item as UserProfile;
    // Kullanıcı adında tam eşleşme
    if (user.displayName.toLowerCase() === lowerQuery) {
      relevance += 100;
    }
    // Kullanıcı adı içinde geçiyorsa
    else if (matchContent(user.displayName, query)) {
      relevance += 80;
    }
    // E-postada geçiyorsa
    if (matchContent(user.email, query)) {
      relevance += 60;
    }
    // Biyografide geçiyorsa
    if (user.bio && matchContent(user.bio, query)) {
      relevance += 40;
    }
  }
  
  // Maksimum 100 puan
  return Math.min(100, relevance);
}

// Genel arama fonksiyonu
export async function search(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }
  
  // Her türden içerik için arama sonuçlarını toplayalım
  const results: SearchResult[] = [];
  
  // Blog yazılarında arama
  const blogPosts = await getBlogPosts({ status: 'published', perPage: 100 });
  const matchingPosts = blogPosts.posts.filter(post => 
    matchContent(post.title, query) || 
    matchContent(post.content, query) ||
    (post.excerpt && matchContent(post.excerpt, query)) ||
    (post.tags && post.tags.some(tag => matchContent(tag, query)))
  );
  
  // Blog sonuçlarını ekle
  matchingPosts.forEach(post => {
    const relevance = calculateRelevance(post, query, 'blog');
    
    // Tip hatalarını düzeltmek için null ve undefined kontrolü
    if (post.id) { // id alanının varlığını kontrol et
      results.push({
        id: post.id, // Artık post.id kesinlikle string
        type: 'blog',
        title: post.title,
        description: post.excerpt || post.content.substring(0, 150) + '...',
        url: `/blog/${post.slug}`,
        image: post.coverImage || undefined, // null ise undefined'a dönüştür
        date: post.publishedAt,
        relevance
      });
    }
  });
  
  // Sadece admin için: Kullanıcılarda arama
  if (false) { // isAdmin kontrolü burada yapılacak
    const users = await getUsers();
    const matchingUsers = users.filter(user => 
      matchContent(user.displayName, query) || 
      matchContent(user.email, query) ||
      (user.bio && matchContent(user.bio, query))
    );
    
    // Kullanıcı sonuçlarını ekle
    matchingUsers.forEach(user => {
      const relevance = calculateRelevance(user, query, 'user');
      
      results.push({
        id: user.id,
        type: 'user',
        title: user.displayName,
        description: user.email,
        url: `/admin/kullanicilar?id=${user.id}`,
        image: user.photoURL || undefined, // null ise undefined'a dönüştür
        relevance
      });
    });
  }
  
  // Sonuçları alaka düzeyine göre sırala
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Filtreleme tiplerine göre arama fonksiyonu
export async function searchByType(query: string, type: SearchResultType): Promise<SearchResult[]> {
  const allResults = await search(query);
  return allResults.filter(result => result.type === type);
}