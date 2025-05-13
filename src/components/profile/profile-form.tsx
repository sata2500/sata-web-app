// src/components/profile/profile-form.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertIcon } from '@/components/ui/alert';
import { updateUserProfile, uploadProfilePhoto } from '@/lib/user-service';
import { UserAuth } from '@/types/user';

interface ProfileFormProps {
  user: UserAuth;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profil resmi seçildiğinde
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (ör. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Profil resmi en fazla 5MB olabilir.');
      return;
    }

    // Dosya tipi kontrolü
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Lütfen geçerli bir resim dosyası yükleyin (JPEG, PNG, GIF, WEBP).');
      return;
    }

    setImageFile(file);
    
    // Seçilen resmin önizlemesini oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Resim seçme dialogunu aç
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Görünen ad kontrolü
      if (!displayName.trim()) {
        setError('Lütfen görünen adınızı girin.');
        setLoading(false);
        return;
      }

      // Eğer resim yüklendiyse önce resmi yükle
      let photoURL = user.photoURL;
      if (imageFile) {
        photoURL = await uploadProfilePhoto(imageFile, user.id);
      }

      // Kullanıcı profilini güncelle
      await updateUserProfile(user.id, {
        displayName,
        photoURL,
        bio
      });

      setSuccess(true);
      router.refresh(); // UI'ı güncelle
    } catch (err: unknown) {
      console.error('Profil güncellenirken bir hata oluştu:', err);
      
      if (err instanceof Error) {
        setError(err.message || 'Profil güncellenirken bir hata oluştu.');
      } else {
        setError('Profil güncellenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertIcon />
          Profil bilgileriniz başarıyla güncellendi.
        </Alert>
      )}

      <div className="space-y-4">
        {/* Profil Resmi */}
        <div className="flex flex-col items-center">
          <div 
            className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-border cursor-pointer"
            onClick={triggerFileInput}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">Değiştir</span>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={triggerFileInput}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Profil fotoğrafını değiştir
          </button>
        </div>

        {/* Görünen Ad */}
        <div className="space-y-2">
          <label htmlFor="displayName" className="block text-sm font-medium">
            Görünen Ad
          </label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium">
            Hakkında
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendiniz hakkında kısa bir bilgi ekleyin"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            En fazla 200 karakter. {bio.length}/200
          </p>
        </div>
      </div>

      <Button type="submit" isLoading={loading}>
        Profili Güncelle
      </Button>
    </form>
  );
}