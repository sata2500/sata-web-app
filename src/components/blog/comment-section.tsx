// src/components/blog/comment-section.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { CommentForm } from '@/components/blog/comment-form';
import { CommentItem } from '@/components/blog/comment-item';
import { getCommentsByPostId } from '@/lib/blog-service';
import { BlogComment } from '@/types/blog';
import Link from 'next/link'; // <a> etiketini Link ile değiştirmek için

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback kullanarak fetchComments fonksiyonunu memoize ediyoruz
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedComments = await getCommentsByPostId(postId);
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
  }, [fetchComments, postId]); // fetchComments bağımlılığını ekledik

  const handleNewComment = () => {
    // newComment parametresini kullanmıyoruz, bu yüzden kaldırdık
    // Yorum ekledikten sonra tüm yorumları yeniden yükle
    fetchComments();
  };

  // Üst seviye yorumlar ve cevapları grupla
  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      // Üst seviye yorum
      acc.push({
        ...comment,
        replies: comments.filter(reply => reply.parentId === comment.id)
      });
    }
    return acc;
  }, [] as (BlogComment & { replies: BlogComment[] })[]);

  return (
    <div className="space-y-8 mt-12">
      <h3 className="text-2xl font-bold">Yorumlar ({comments.length})</h3>
      
      {user ? (
        <CommentForm postId={postId} onCommentSubmit={handleNewComment} />
      ) : (
        <div className="bg-primary/5 p-4 rounded-md text-center">
          <p className="mb-2">Yorum yapmak için giriş yapmalısınız.</p>
          <Link href="/giris" className="text-primary font-medium">
            Giriş Yap &rarr;
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-error/10 text-error p-4 rounded-md text-center">
          {error}
          <button
            onClick={() => fetchComments()}
            className="ml-2 underline hover:no-underline"
          >
            Yeniden Dene
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-foreground/60">
          <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedComments.map(comment => (
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
    </div>
  );
};