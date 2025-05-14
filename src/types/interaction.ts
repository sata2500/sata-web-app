// src/types/interaction.ts
import { Timestamp } from 'firebase/firestore';

// Etkileşim tipleri
export type InteractionType = 'like' | 'save' | 'view' | 'share';

// Etkileşim yapılan içerik tipi
export type ContentType = 'blog_post' | 'comment';

// Etkileşim temel modeli
export interface Interaction {
  id?: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  interactionType: InteractionType;
  createdAt: Timestamp | Date;
}

// Beğeni modeli
export interface Like extends Interaction {
  interactionType: 'like';
}

// Kaydetme modeli
export interface Save extends Interaction {
  interactionType: 'save';
  collections?: string[]; // Koleksiyonlara kaydetme opsiyonu için
}

// Görüntülenme modeli
export interface View extends Interaction {
  interactionType: 'view';
  duration?: number; // Görüntülenme süresi (saniye)
}

// Paylaşım modeli
export interface Share extends Interaction {
  interactionType: 'share';
  platform?: string; // Hangi platformda paylaşıldı (twitter, facebook, vb.)
}

// Etkileşim istatistikleri
export interface InteractionStats {
  likeCount: number;
  saveCount: number;
  viewCount: number;
  shareCount: number;
}