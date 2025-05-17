// src/components/blog/comment-section.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { CommentForm } from '@/components/blog/comment-form';
import { CommentItem } from '@/components/blog/comment-item';
import { getCommentsByPostId } from '@/lib/blog-service';
import { BlogComment } from '@/types/blog';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { Badge } from '@/components/ui/badge';

// BlogComment tipini genişletiyoruz
interface ExtendedBlogComment extends BlogComment {
  likes?: string[]; // beğenen kullanıcı ID listesi
  userId?: string;  // yorumu yazan kullanıcı ID'si
  userName?: string; // yorumu yazan kullanıcı adı
  userAvatar?: string; // yorumu yazan kullanıcı profil resmi
}

// ExtendedBlogComment ve replüleri içeren tip
interface GroupedComment extends ExtendedBlogComment {
  replies: ExtendedBlogComment[];
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ExtendedBlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // useCallback kullanarak fetchComments fonksiyonunu memoize ediyoruz
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      // Tip dönüşümü yaparak BlogComment'i ExtendedBlogComment olarak kabul ediyoruz
      // Bu geçici bir çözüm, ideal olarak getCommentsByPostId API'sinin dönüş tipi güncellenmeli
      const fetchedComments = await getCommentsByPostId(postId) as unknown as ExtendedBlogComment[];
      setComments(fetchedComments);
      setError(null);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata oluştu:', err);
      setError('Yorumlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [fetchComments, postId]);

  const handleNewComment = useCallback(() => {
    // Yeni yorum eklendiğinde başarı mesajı göster
    setSuccessMessage('Yorumunuz başarıyla gönderildi. Onaylandıktan sonra görüntülenecektir.');
    
    // 5 saniye sonra başarı mesajını kaldır
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
    
    // Yorumları yeniden yükle
    fetchComments();
  }, [fetchComments]);

  // Üst seviye yorumlar ve cevapları grupla
  const groupedComments: GroupedComment[] = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      // Üst seviye yorum
      acc.push({
        ...comment,
        replies: comments.filter(reply => reply.parentId === comment.id)
      });
    }
    return acc;
  }, [] as GroupedComment[]);

  // Yorumları sırala
  const sortedComments = [...groupedComments].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        // Likes null güvenlik kontrolü eklendi
        return ((b.likes?.length || 0) - (a.likes?.length || 0));
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <FadeIn direction="up" className="space-y-8 mt-12">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          Yorumlar 
          <Badge variant="subtle" className="ml-2">{comments.length}</Badge>
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-foreground/60 mr-2 hidden sm:inline">Sıralama:</span>
          <div className="flex rounded-md overflow-hidden border border-border">
            <button 
              onClick={() => setSortOrder('newest')}
              className={`text-xs px-2 py-1 ${
                sortOrder === 'newest' 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-background/90'
              }`}
            >
              En Yeni
            </button>
            <button 
              onClick={() => setSortOrder('oldest')}
              className={`text-xs px-2 py-1 border-l border-r border-border ${
                sortOrder === 'oldest' 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-background/90'
              }`}
            >
              En Eski
            </button>
            <button 
              onClick={() => setSortOrder('popular')}
              className={`text-xs px-2 py-1 ${
                sortOrder === 'popular' 
                  ? 'bg-primary text-white' 
                  : 'bg-card hover:bg-background/90'
              }`}
            >
              Popüler
            </button>
          </div>
        </div>
      </div>
      
      {successMessage && (
        <Alert 
          variant="success" 
          title="Başarılı"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      {user ? (
        <Card className="p-6 border">
          <CommentForm postId={postId} onCommentSubmit={handleNewComment} />
        </Card>
      ) : (
        <Card className="p-6 border bg-primary/5 text-center">
          <h4 className="font-medium mb-2">Yorum yapmak için giriş yapmalısınız</h4>
          <p className="text-foreground/70 text-sm mb-4">Fikirlerinizi paylaşmak ve tartışmalara katılmak için giriş yapın.</p>
          <div className="flex justify-center space-x-4">
            <Button href="/giris" variant="primary">
              Giriş Yap
            </Button>
            <Button href="/kaydol" variant="outline">
              Kaydol
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
            <p className="text-foreground/60 text-sm">Yorumlar yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="error" className="my-6">
          {error}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchComments()}
            >
              Yeniden Dene
            </Button>
          </div>
        </Alert>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-foreground/5 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-foreground/30 mb-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <h4 className="font-medium mb-2">Henüz yorum yapılmamış</h4>
          <p className="text-foreground/60 mb-4">İlk yorumu siz yapın ve tartışmayı başlatın!</p>
          
          {user ? (
            <Button
              variant="primary"
              onClick={() => {
                // Yorum formuna smooth scroll yapma
                document.querySelector('.comment-form')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
              }}
            >
              İlk Yorumu Yap
            </Button>
          ) : (
            <Link href="/giris">
              <Button variant="primary">Giriş Yap & Yorum Yap</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {sortedComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comment.replies}
              postId={postId}
              onCommentSubmit={handleNewComment}
            />
          ))}
        </div>
      )}
    </FadeIn>
  );
};