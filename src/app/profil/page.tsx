// src/app/profil/page.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateUserProfile } from '@/lib/user-service';

export default function ProfilPage() {
  const router = useRouter();
  const { user, userProfile, loading, error, signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Kullanıcı giriş yapmadıysa, giriş sayfasına yönlendir
  if (!loading && !user) {
    router.push('/giris?redirect=/profil');
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu:', err);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    
    try {
      await updateUserProfile(user.id, {
        displayName,
        bio,
        website
      });
      
      setIsEditing(false);
    } catch (err: unknown) {
      console.error('Profil güncellenirken hata oluştu:', err);
      
      if (err instanceof Error) {
        setUpdateError(err.message || 'Profil güncellenirken bir hata oluştu.');
      } else {
        setUpdateError('Profil güncellenirken bir hata oluştu.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Container className="py-16">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profil</CardTitle>
            <CardDescription>
              Hesap bilgilerinizi görüntüleyin ve düzenleyin.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {(error || updateError) && (
              <div className="bg-error/10 text-error p-3 rounded-md">
                {error || updateError}
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {user?.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'Profil resmi'} 
                      width={64}  
                      height={64} 
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl">
                      {user?.displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium">{isEditing ? (
                      <Input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        disabled={updateLoading}
                      />
                    ) : user?.displayName}</h3>
                    <p className="text-sm text-foreground/60">{user?.email}</p>
                  </div>
                </div>
                
                {userProfile && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Hakkında</label>
                      {isEditing ? (
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Kendiniz hakkında kısa bir bilgi"
                          disabled={updateLoading}
                          rows={3}
                        />
                      ) : (
                        <p className="mt-1 text-foreground/80">
                          {userProfile.bio || 'Henüz bir bio eklenmemiş.'}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Web Sitesi</label>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://example.com"
                          disabled={updateLoading}
                        />
                      ) : (
                        <p className="mt-1 text-foreground/80">
                          {userProfile.website ? (
                            <a 
                              href={userProfile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {userProfile.website}
                            </a>
                          ) : (
                            'Henüz bir web sitesi eklenmemiş.'
                          )}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Rol</label>
                      <p className="mt-1 text-foreground/80">
                        {userProfile.role === 'admin' ? 'Yönetici' : 
                         userProfile.role === 'editor' ? 'Editör' : 'Kullanıcı'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Katılma Tarihi</label>
                      <p className="mt-1 text-foreground/80">
                        {new Date(userProfile.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleLogout}>
              Çıkış Yap
            </Button>
            
            {!loading && userProfile && (
              isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={updateLoading}
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="mr-2">Kaydediliyor</span>
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Profili Düzenle
                </Button>
              )
            )}
          </CardFooter>
        </Card>
        
        {!loading && user?.isAdmin && (
          <div className="mt-6 text-center">
            <Button href="/admin" variant="outline">
              Admin Paneline Git
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}