'use client';

import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/auth-context';
import { getUserCollections, addToCollection, removeFromCollection, getContentCollections } from '@/lib/collection-service';
import { Collection } from '@/types/collection';
import Link from 'next/link';

interface AddToCollectionButtonProps {
  contentId: string;
  contentType: 'blog_post' | 'comment';
  variant?: 'outline' | 'ghost';
  size?: 'sm' | 'lg';
  className?: string;
}

export function AddToCollectionButton({
  contentId,
  contentType,
  variant = 'outline',
  size = 'sm',
  className = ''
}: AddToCollectionButtonProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Koleksiyonları ve içeriğin mevcut koleksiyonlarını yükle
  useEffect(() => {
    const loadData = async () => {
      if (!user || !isOpen) return;
      
      try {
        setIsLoading(true);
        
        // Kullanıcının tüm koleksiyonlarını getir
        const userCollections = await getUserCollections(user.id);
        setCollections(userCollections);
        
        // İçeriğin hangi koleksiyonlarda olduğunu kontrol et
        const contentCollections = await getContentCollections(user.id, contentId);
        setSelectedCollections(contentCollections.map(c => c.id as string));
      } catch (error) {
        console.error('Koleksiyonlar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isOpen) {
      loadData();
    }
  }, [user, contentId, isOpen]);
  
  // Koleksiyon seçimini değiştir
  const toggleCollection = async (collectionId: string, isChecked: boolean) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (isChecked) {
        // Koleksiyona ekle
        await addToCollection(user.id, collectionId, contentId, contentType);
        setSelectedCollections(prev => [...prev, collectionId]);
      } else {
        // Koleksiyondan çıkar
        await removeFromCollection(user.id, collectionId, contentId);
        setSelectedCollections(prev => prev.filter(id => id !== collectionId));
      }
    } catch (error) {
      console.error('Koleksiyon işlemi sırasında hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Arama terimine göre filtrelenmiş koleksiyonlar
  const filteredCollections = collections.filter(
    collection => collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!user) {
    return null;
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          aria-label="Koleksiyona Ekle"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Koleksiyona Ekle</h3>
            <Input 
              type="text"
              placeholder="Koleksiyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
          </div>
          
          {isLoading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin h-4 w-4 border-2 border-primary border-r-transparent rounded-full mb-2"></div>
              <p className="text-sm">Koleksiyonlar yükleniyor...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-sm mb-2">Henüz koleksiyonunuz yok.</p>
              <Button asChild size="sm" className="mt-2">
                <Link href="/profil/koleksiyonlar/yeni">
                  Yeni Koleksiyon Oluştur
                </Link>
              </Button>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-sm">Arama sonucunda koleksiyon bulunamadı.</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`collection-${collection.id}`}
                    checked={selectedCollections.includes(collection.id as string)}
                    onCheckedChange={(checked: boolean) => {
                      toggleCollection(collection.id as string, checked);
                    }}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={`collection-${collection.id}`}
                    className="flex-grow cursor-pointer text-sm"
                  >
                    {collection.name}
                    {collection.isPrivate && (
                      <span className="ml-2 text-xs bg-secondary/50 px-1.5 py-0.5 rounded-full">
                        Özel
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-2 flex justify-between items-center border-t">
            <Button 
              asChild
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-primary text-xs"
            >
              <Link href="/profil/koleksiyonlar/yeni">
                + Yeni Koleksiyon Oluştur
              </Link>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Kapat
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}