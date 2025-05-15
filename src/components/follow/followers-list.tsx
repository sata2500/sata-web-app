// src/components/follow/followers-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { getFollowers } from '@/lib/follow-service';
import { UserProfile } from '@/types/user';
import { UserCard } from '@/components/follow/user-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FollowersListProps {
  userId: string;
  limit?: number;
  showSearch?: boolean;
  compact?: boolean;
}

export function FollowersList({
  userId,
  limit = 10,
  showSearch = true,
  compact = false
}: FollowersListProps) {
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadFollowers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFollowers(userId, limit);
        setFollowers(data);
        setFilteredFollowers(data);
      } catch (err) {
        console.error('Takipçiler yüklenirken hata:', err);
        setError('Takipçiler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFollowers();
  }, [userId, limit]);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers(followers);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = followers.filter(
      follower =>
        follower.displayName.toLowerCase().includes(query) ||
        follower.email.toLowerCase().includes(query)
    );
    
    setFilteredFollowers(filtered);
  }, [searchQuery, followers]);
  
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
  
  if (followers.length === 0) {
    return (
      <div className="text-center py-8 bg-secondary/20 rounded-lg">
        <p className="text-foreground/60">Henüz takipçi yok.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Takipçilerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      
      {filteredFollowers.length === 0 ? (
        <div className="text-center py-8 bg-secondary/20 rounded-lg">
          <p className="text-foreground/60">Arama sonucunda takipçi bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFollowers.map((follower) => (
            <UserCard
              key={follower.id}
              user={follower}
              showFollowButton={!compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}