// src/components/collections/collection-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collection } from '@/types/collection';
import { formatRelativeTime } from '@/lib/utils';

interface CollectionCardProps {
  collection: Collection;
  displayActions?: boolean;
  onDeleteClick?: (id: string) => void;
  className?: string;
}

export function CollectionCard({
  collection,
  displayActions = true,
  onDeleteClick,
  className = ''
}: CollectionCardProps) {
  const { id, name, description, coverImage, itemCount, isPrivate, updatedAt } = collection;
  
  return (
    <Card className={`overflow-hidden flex flex-col h-full ${className}`}>
      <Link href={`/profil/koleksiyonlar/${id}`} className="block">
        {coverImage ? (
          <div className="aspect-[16/9] w-full overflow-hidden relative">
            <Image 
              src={coverImage} 
              alt={name} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full flex items-center justify-center bg-secondary/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor" 
              className="w-12 h-12 text-primary/40"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}
      </Link>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1 text-lg">
            <Link href={`/profil/koleksiyonlar/${id}`} className="hover:text-primary transition-colors">
              {name}
            </Link>
          </CardTitle>
          
          {isPrivate && (
            <div className="flex items-center bg-secondary/50 px-2 py-1 rounded-full text-xs">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-3 h-3 mr-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Özel
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        {description && (
          <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
            {description}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-xs text-foreground/60">
          <div className="flex items-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-3 h-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span>{itemCount} içerik</span>
          </div>
          
          <div className="flex items-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-3 h-3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatRelativeTime(updatedAt)} güncellendi</span>
          </div>
        </div>
      </CardContent>
      
      {displayActions && (
        <CardFooter className="pt-2">
          <div className="flex gap-2 w-full">
            <Button 
              asChild
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Link href={`/profil/koleksiyonlar/${id}`}>
                Görüntüle
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              size="sm"
            >
              <Link href={`/profil/koleksiyonlar/${id}/duzenle`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </Link>
            </Button>
            
            {onDeleteClick && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteClick(id as string)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-4 h-4 text-destructive"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}