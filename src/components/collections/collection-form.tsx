// src/components/collections/collection-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
// Collection tipini kaldıralım (kullanılmıyorsa)
import { 
  createCollection, 
  updateCollection, 
  getCollection 
} from '@/lib/collection-service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface CollectionFormProps {
  collectionId?: string;
  mode: 'create' | 'edit';
}

export function CollectionForm({ collectionId, mode }: CollectionFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modunda koleksiyon verilerini yükle
  useEffect(() => {
    const loadCollection = async () => {
      if (mode === 'edit' && collectionId) {
        try {
          const collection = await getCollection(collectionId);
          
          if (!collection) {
            setError('Koleksiyon bulunamadı.');
            return;
          }
          
          // Koleksiyon bu kullanıcıya ait mi kontrol et
          if (collection.userId !== user?.id) {
            setError('Bu koleksiyonu düzenleme yetkiniz yok.');
            return;
          }
          
          setName(collection.name);
          setDescription(collection.description || '');
          setIsPrivate(collection.isPrivate);
        } catch (err) {
          console.error('Koleksiyon yüklenirken hata:', err);
          setError('Koleksiyon bilgileri yüklenirken bir hata oluştu.');
        }
      }
    };
    
    if (user) {
      loadCollection();
    }
  }, [mode, collectionId, user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Oturum açmanız gerekiyor.');
      return;
    }
    
    if (!name.trim()) {
      setError('Koleksiyon adı gereklidir.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (mode === 'create') {
        // Yeni koleksiyon oluştur
        const id = await createCollection(
          user.id,
          name.trim(),
          description.trim() || undefined,
          isPrivate
        );
        
        router.push(`/profil/koleksiyonlar/${id}`);
      } else if (mode === 'edit' && collectionId) {
        // Koleksiyonu güncelle
        await updateCollection(collectionId, {
          name: name.trim(),
          description: description.trim() || undefined,
          isPrivate
        });
        
        router.push(`/profil/koleksiyonlar/${collectionId}`);
      }
    } catch (err) {
      console.error('Koleksiyon kaydedilirken hata:', err);
      setError('Koleksiyon kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="collection-name">Koleksiyon Adı *</Label>
          <Input
            id="collection-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Favori Makalelerim"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="collection-description">Açıklama</Label>
          <Textarea
            id="collection-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bu koleksiyon hakkında kısa bir açıklama..."
            className="mt-1 h-24"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="mb-1">Özel Koleksiyon</Label>
            <p className="text-sm text-foreground/60">
              Özel koleksiyonlar yalnızca siz tarafından görüntülenebilir.
            </p>
          </div>
          <Switch
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
            aria-label="Özel Koleksiyon"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {mode === 'create' ? 'Oluşturuluyor...' : 'Güncelleniyor...'}
            </>
          ) : (
            mode === 'create' ? 'Koleksiyon Oluştur' : 'Koleksiyon Güncelle'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          İptal
        </Button>
      </div>
    </form>
  );
}