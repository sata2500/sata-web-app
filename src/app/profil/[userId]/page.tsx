// src/app/profil/[userId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FollowButton } from '@/components/follow/follow-button';
import { getUserProfile } from '@/lib/user-service';
import { getFollowStats, checkIfFollowing } from '@/lib/follow-service';
import { FollowersList } from '@/components/follow/followers-list';
import { FollowingList } from '@/components/follow/following-list';
import { UserProfile } from '@/types/user';
import { FollowStats } from '@/types/follow';
import { useAuth } from '@/context/auth-context';

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isOwnProfile = user?.id === userId;
  
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Kullanıcı profili
        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
          setError('Kullanıcı bulunamadı.');
          setLoading(false);
          return;
        }
        
        setProfile(userProfile);
        
        // Takip istatistikleri
        const stats = await getFollowStats(userId);
        setFollowStats(stats);
        
        // Takip ediliyor mu?
        if (user && user.id !== userId) {
          const following = await checkIfFollowing(user.id, userId);
          setIsFollowing(following);
        }
      } catch (err) {
        console.error('Profil yüklenirken hata:', err);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadProfile();
    }
  }, [userId, user]);
  
  const handleFollowChange = (following: boolean) => {
    setIsFollowing(following);
    // Takipçi sayısını güncelle
    setFollowStats({
      ...followStats,
      followersCount: following 
        ? followStats.followersCount + 1 
        : Math.max(0, followStats.followersCount - 1)
    });
  };
  
  if (loading) {
    return (
      <Container>
        <div className="py-12">
          <div className="animate-pulse">
            <div className="h-32 bg-secondary rounded-lg mb-8"></div>
            <div className="h-64 bg-secondary rounded-lg"></div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (error || !profile) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Hata</h1>
          <p className="mb-6">{error || 'Kullanıcı bulunamadı.'}</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profil Başlığı */}
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="shrink-0">
              {profile.photoURL ? (
                <Image
                  src={profile.photoURL}
                  alt={profile.displayName}
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              ) : (
                <div className="w-32 h-32 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold">
                  {profile.displayName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
              <div className="text-foreground/60 mb-4">{profile.email}</div>
              
              {profile.bio && (
                <p className="mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 items-center">
                <Link href={`/profil/${userId}/takipciler`} className="flex items-center gap-1">
                  <span className="font-bold">{followStats.followersCount}</span>
                  <span className="text-foreground/60">Takipçi</span>
                </Link>
                
                <Link href={`/profil/${userId}/takip-ettikleri`} className="flex items-center gap-1">
                  <span className="font-bold">{followStats.followingCount}</span>
                  <span className="text-foreground/60">Takip</span>
                </Link>
                
                {!isOwnProfile && (
                  <FollowButton 
                    userId={userId} 
                    initialFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                )}
                
                {isOwnProfile && (
                  <Button variant="outline" asChild>
                    <Link href="/profil/duzenle">Profili Düzenle</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Sekme Menüsü */}
          <Tabs defaultValue="followers" className="mt-8">
            <TabsList className="w-full mb-8">
              <TabsTrigger value="followers" className="flex-1">Takipçiler</TabsTrigger>
              <TabsTrigger value="following" className="flex-1">Takip Edilenler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="followers" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Takipçiler</CardTitle>
                </CardHeader>
                <CardContent>
                  <FollowersList userId={userId} limit={6} />
                  
                  {followStats.followersCount > 6 && (
                    <div className="mt-4 text-center">
                      <Button asChild variant="outline">
                        <Link href={`/profil/${userId}/takipciler`}>
                          Tüm Takipçileri Görüntüle
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="following" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Takip Edilenler</CardTitle>
                </CardHeader>
                <CardContent>
                  <FollowingList userId={userId} limit={6} />
                  
                  {followStats.followingCount > 6 && (
                    <div className="mt-4 text-center">
                      <Button asChild variant="outline">
                        <Link href={`/profil/${userId}/takip-ettikleri`}>
                          Tüm Takip Edilenleri Görüntüle
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
}