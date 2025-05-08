// src/components/blog/comment-form.tsx

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createComment } from '@/lib/blog-service';
import { BlogComment } from '@/types/blog';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentSubmit: (comment: BlogComment) => void;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({ 
  postId, 
  parentId,
  onCommentSubmit, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Yorum içeriği boş olamaz.');
      return;
    }

    if (!user) {
      setError('Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newComment: Omit<BlogComment, 'id' | 'createdAt'> = {
        postId,
        content: content.trim(),
        author: {
          id: user.id,
          name: user.displayName || user.email.split('@')[0],
          avatar: user.photoURL || null
        },
        status: 'pending',
        ...(parentId && { parentId })
      };

      const commentId = await createComment(newComment);
      
      // Yorum nesnesini oluştur
      const createdComment: BlogComment = {
        ...newComment,
        id: commentId,
        createdAt: Date.now()
      };

      // Parent component'e bildir
      onCommentSubmit(createdComment);
      
      // Formu sıfırla
      setContent('');
    } catch (err) {
      console.error('Yorum gönderilirken hata oluştu:', err);
      setError('Yorumunuz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yorumunuzu buraya yazın..."
          rows={4}
          disabled={loading}
        />
        {error && <p className="text-error text-sm mt-1">{error}</p>}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            İptal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2">Gönderiliyor</span>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
            </>
          ) : (
            'Yorumu Gönder'
          )}
        </Button>
      </div>
    </form>
  );
};