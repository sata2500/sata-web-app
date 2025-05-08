// src/types/blog.ts

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string | null;
    tags: string[];
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