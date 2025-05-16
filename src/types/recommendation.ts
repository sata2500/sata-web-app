// src/types/recommendation.ts
import { BlogPost } from './blog';

// Öneri sistemi için tip tanımlamaları
export interface Recommendation {
  id?: string;
  userId: string;
  contentId: string;
  contentType: 'blog_post' | 'comment';
  score: number; // Öneri skoru (0-100 arası)
  reason: RecommendationReason;
  timestamp: number; // Unix timestamp
  viewed?: boolean; // Görüntülenip görüntülenmediği
  interacted?: boolean; // Etkileşimde bulunulup bulunulmadığı
}

// Öneri nedeni
export type RecommendationReason = 
  | 'interest' // İlgi alanına göre
  | 'similar' // Benzer içerik
  | 'popular' // Popüler içerik
  | 'following' // Takip edilen kullanıcılardan
  | 'trending'; // Trend olan içerik

// Kullanıcı ilgi alanları
export interface UserInterest {
  id?: string;
  userId: string;
  category: string; // İlgi alanı kategorisi
  tags: string[]; // İlgili etiketler
  weight: number; // Ağırlık (0-1 arası)
  source: 'explicit' | 'implicit'; // Açık (kullanıcı tarafından belirtilen) veya örtük (sistem tarafından çıkarılan)
  timestamp: number;
}

// İçerik benzerlik bilgisi
export interface ContentSimilarity {
  contentId: string;
  similarContentId: string;
  score: number; // Benzerlik skoru (0-1 arası)
}

// İçerik önerisi görünümü (UI için)
export interface RecommendationView {
  id: string;
  content: BlogPost;
  reason: RecommendationReason;
  reasonText: string; // Kullanıcıya gösterilecek neden
  score: number;
}

// Öneri filtreleme seçenekleri
export interface RecommendationFilter {
  reason?: RecommendationReason;
  category?: string;
  tags?: string[];
  limit?: number;
}

// Kullanıcı ilgi alanı tercihi
export interface UserInterestPreference {
  id?: string;
  userId: string;
  categories: string[]; // İlgilenilen kategoriler
  tags: string[]; // İlgilenilen etiketler
  excludedTags: string[]; // İlgilenmediği etiketler
  updatedAt: number; // Son güncelleme zamanı
}