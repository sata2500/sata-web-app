// src/app/api/blog/view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateDocument, setDocument } from '@/lib/firebase-service';
import { InteractionStats } from '@/types/interaction';

const STATS_COLLECTION = 'interaction_stats';

export async function POST(request: NextRequest) {
  try {
    // URL'den postId parametresini al
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');
    
    console.log('API received request for postId:', postId);
    
    if (!postId) {
      return NextResponse.json(
        { error: 'postId parametresi gereklidir' }, 
        { status: 400 }
      );
    }
    
    // İstatistik belgesinin kimliği
    const statsId = `blog_post_${postId}`;
    
    try {
      // Mevcut istatistikleri kontrol et
      const stats = await getDocument<InteractionStats>(STATS_COLLECTION, statsId);
      
      if (stats) {
        // Görüntülenme sayısını artır
        await updateDocument(STATS_COLLECTION, statsId, {
          viewCount: (stats.viewCount || 0) + 1
        });
      } else {
        // Yeni istatistik oluştur
        await setDocument(STATS_COLLECTION, statsId, {
          likeCount: 0,
          saveCount: 0,
          viewCount: 1,
          shareCount: 0
        });
      }
      
      return NextResponse.json({ success: true });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Veritabanı işlemi sırasında bir hata oluştu' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Görüntülenme kaydedilirken genel hata:', error);
    return NextResponse.json(
      { error: 'Görüntülenme kaydedilirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
}