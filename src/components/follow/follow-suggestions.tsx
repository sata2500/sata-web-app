// src/components/follow/follow-suggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import { getFollowSuggestions } from '@/lib/follow-service';
import { FollowSuggestion } from '@/types/follow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { FollowButton } from '@/components/follow/follow-button';
import { useAuth } from '@/context/auth-context';

interface FollowSuggestionsProps {
  limit?: number;
  className?: string;
}

export function FollowSuggestions({ limit = 3, className = '' }: FollowSuggestionsProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<FollowSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFollowSuggestions(user.id, limit);
        setSuggestions(data);
      } catch (err) {
        console.error('Takip önerileri yüklenirken hata:', err);
        setError('Takip önerileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadSuggestions();
    }
  }, [user, limit]);
  
  const handleFollowChange = (userId: string, following: boolean) => {
    if (following) {
      // Takip edildiğinde önerilerden kaldır
      setSuggestions((prevSuggestions) => 
        prevSuggestions.filter((suggestion) => suggestion.userId !== userId)
      );
    }
  };
  
  if (!user) return null;
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Takip Önerileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="rounded-full bg-secondary h-10 w-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-secondary rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-secondary rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-secondary rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Takip Önerileri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/60 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Takip Önerileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.userId} className="flex items-center gap-3">
              <Link href={`/profil/${suggestion.userId}`} className="shrink-0">
                {suggestion.photoURL ? (
                  <Image
                    src={suggestion.photoURL}
                    alt={suggestion.displayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                    {suggestion.displayName[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
              
              <div className="flex-grow min-w-0">
                <Link href={`/profil/${suggestion.userId}`} className="block hover:underline font-medium truncate">
                  {suggestion.displayName}
                </Link>
                {suggestion.bio && (
                  <p className="text-foreground/60 text-sm truncate">{suggestion.bio}</p>
                )}
              </div>
              
              <div className="shrink-0">
                <FollowButton
                  userId={suggestion.userId}
                  size="sm"
                  onFollowChange={(following) => handleFollowChange(suggestion.userId, following)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}