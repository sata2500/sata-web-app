// src/components/follow/following-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { getFollowing } from '@/lib/follow-service';
import { UserProfile } from '@/types/user';
import { UserCard } from '@/components/follow/user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FollowingListProps {
  userId: string;
  limit?: number;
  showSearch?: boolean;
  compact?: boolean;
}

export function FollowingList({
  userId,
  limit = 10,
  showSearch = true,
  compact = false
}: FollowingListProps) {
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [filteredFollowing, setFilteredFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFollowing = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFollowing(userId, limit);
        setFollowing(data);
        setFilteredFollowing(data);
      } catch (err) {
        console.error('Takip edilenler yüklenirken hata:', err);
        setError('Takip edilen kullanıcılar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFollowing();
  }, [userId, limit]);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowing(following);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = following.filter(
      user =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    
    setFilteredFollowing(filtered);
  }, [searchQuery, following]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-secondary rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Yeniden Dene
        </Button>
      </div>
    );
  }
  
  if (following.length === 0) {
    return (
      <div className="text-center py-8 bg-secondary/20 rounded-lg">
        <p className="text-foreground/60">Henüz takip edilen kullanıcı yok.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Takip edilenlerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      
      {filteredFollowing.length === 0 ? (
        <div className="text-center py-8 bg-secondary/20 rounded-lg">
          <p className="text-foreground/60">Arama sonucunda kullanıcı bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFollowing.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isFollowing={true}
              showFollowButton={!compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}