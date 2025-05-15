// src/types/follow.ts

export interface Follow {
  id?: string;
  followerId: string; // Takip eden kullanıcı ID'si
  followedId: string; // Takip edilen kullanıcı ID'si
  createdAt: number; // Unix timestamp
}

export interface FollowStats {
  followersCount: number; // Takipçi sayısı
  followingCount: number; // Takip edilen sayısı
}

export interface FollowSuggestion {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  bio?: string;
  mutualFollowersCount?: number; // Ortak takipçi sayısı
}

// UserProfile tipi için eklenecek alanlar
export interface UserProfileWithFollow {
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean; // Geçerli kullanıcı tarafından takip edilip edilmediği
}