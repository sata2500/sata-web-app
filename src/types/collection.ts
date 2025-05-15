// src/types/collection.ts
export interface Collection {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string | null;
  isPrivate: boolean;
  itemCount: number;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

export interface CollectionItem {
  id?: string;
  collectionId: string;
  contentId: string;
  contentType: 'blog_post' | 'comment'; // Şimdilik sadece blog ve yorum desteklenecek
  addedAt: number; // Unix timestamp
  notes?: string; // Opsiyonel kullanıcı notu
}