// src/components/recommendations/recommendation-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecommendationView } from '@/types/recommendation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { markRecommendationAsViewed, markRecommendationAsInteracted } from '@/lib/recommendation-service';

interface RecommendationCardProps {
  recommendation: RecommendationView;
  onInteract?: (recommendationId: string) => void;
}

export function RecommendationCard({ recommendation, onInteract }: RecommendationCardProps) {
  // Kullanılmayan 'isViewing' durumunu kaldırdık
  
  const handleView = async () => {
    try {
      // Öneriyi görüntülendi olarak işaretle
      await markRecommendationAsViewed(recommendation.id);
    } catch (error) {
      console.error('Öneri görüntüleme hatası:', error);
    }
  };
  
  const handleInteract = async () => {
    try {
      // Öneriyi etkileşimde bulunuldu olarak işaretle
      await markRecommendationAsInteracted(recommendation.id);
      
      // Callback'i çağır (isteğe bağlı)
      if (onInteract) {
        onInteract(recommendation.id);
      }
    } catch (error) {
      console.error('Öneri etkileşim hatası:', error);
    }
  };
  
  const { content } = recommendation;
  const publishDate = new Date(content.publishedAt);
  
  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        {recommendation.reason && (
          <Badge variant="secondary" className="absolute top-2 right-2 z-10">
            {recommendation.reasonText}
          </Badge>
        )}
        
        {content.coverImage ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image 
              src={content.coverImage} 
              alt={content.title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-secondary/20 rounded-t-lg flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1} 
              stroke="currentColor" 
              className="w-12 h-12 text-secondary"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
      </div>
      
      <CardHeader className={content.coverImage ? "pb-2" : "pb-2 pt-4"}>
        <CardTitle className="line-clamp-2">{content.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-1 flex-grow">
        <p className="text-foreground/80 line-clamp-3">{content.excerpt}</p>
        
        <div className="flex items-center gap-2 mt-3 text-sm text-foreground/60">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{format(publishDate, 'PPP', { locale: tr })}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          asChild
          className="w-full"
          onMouseEnter={handleView}
          onClick={handleInteract}
        >
          <Link href={`/blog/${content.slug}`}>
            Okumaya Başla
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}