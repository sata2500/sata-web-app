// src/types/user.ts

export interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
    bio?: string;
    website?: string;
    role: 'user' | 'admin' | 'editor';
    createdAt: number;
    updatedAt: number;
  }
  
  export interface UserAuth {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    isAdmin: boolean;
    isEditor: boolean;
  }