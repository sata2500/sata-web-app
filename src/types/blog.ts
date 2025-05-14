// src/types/blog.ts

// interface yerine type kullanacağız
export type BlogPost = {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string | null;
    tags: string[];
    // Kategori referansı
    categoryId?: string | null;
    author: {
      id: string;
      name: string;
      avatar?: string | null;
    };
    publishedAt: number; // Unix timestamp
    updatedAt: number; // Unix timestamp
    status: 'draft' | 'published';
    viewCount: number;
    featured: boolean;
}
  
export interface BlogComment {
    id?: string;
    postId: string;
    author: {
      id: string;
      name: string;
      avatar?: string | null;
    };
    content: string;
    createdAt: number; // Unix timestamp
    parentId?: string;
    status: 'pending' | 'approved' | 'rejected';
}

// Kategori tipi
export interface Category {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string | null; // Hiyerarşik kategoriler için
    order?: number; // Sıralama için
    createdAt: number;
    updatedAt: number;
    // İsteğe bağlı özellikler
    icon?: string | null;
    color?: string | null;
    postCount?: number; // İstatistik amaçlı (hesaplanabilir değer)
}

// v1.3 için eklenen yeni türler
export interface Interaction {
    id?: string;
    userId: string;
    contentId: string;
    contentType: 'blog_post' | 'comment';
    interactionType: 'like' | 'save' | 'view' | 'share';
    createdAt: number; // Unix timestamp
    updatedAt?: number; // Unix timestamp
}

export interface InteractionStats {
    likeCount: number;
    saveCount: number;
    viewCount: number;
    shareCount: number;
}