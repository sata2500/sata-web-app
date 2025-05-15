// src/components/follow/user-card.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FollowButton } from '@/components/follow/follow-button';
import { UserProfile } from '@/types/user';
import { useAuth } from '@/context/auth-context';

interface UserCardProps {
  user: UserProfile;
  isFollowing?: boolean;
  showFollowButton?: boolean;
}

export function UserCard({ 
  user, 
  isFollowing = false,
  showFollowButton = true
}: UserCardProps) {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  
  const handleFollowChange = (newFollowingState: boolean) => {
    setFollowing(newFollowingState);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Link href={`/profil/${user.id}`} className="shrink-0">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold">
                {user.displayName[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          
          <div className="flex-grow min-w-0">
            <Link href={`/profil/${user.id}`} className="hover:underline">
              <h3 className="font-medium text-lg truncate">{user.displayName}</h3>
            </Link>
            <p className="text-foreground/60 text-sm">{user.email}</p>
            {user.bio && (
              <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>
            )}
          </div>
          
          {showFollowButton && currentUser && currentUser.id !== user.id && (
            <div className="shrink-0">
              <FollowButton 
                userId={user.id} 
                initialFollowing={following}
                size="sm"
                onFollowChange={handleFollowChange}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}