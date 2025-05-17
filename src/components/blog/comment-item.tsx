// src/components/blog/comment-item.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatRelativeTime } from '@/lib/utils';
import { BlogComment } from '@/types/blog';
import { CommentForm } from '@/components/blog/comment-form';
import { Button } from '@/components/ui/button';
import { Motion, FadeIn } from '@/components/ui/motion';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

// Eksik metodları stub olarak tanımlama
const likeComment = async (commentId: string, userId: string): Promise<void> => {
  console.log("Yorum beğenme isteği:", commentId, userId);
  return Promise.resolve();
};

const deleteComment = async (commentId: string): Promise<void> => {
  console.log("Yorum silme isteği:", commentId);
  return Promise.resolve();
};

// BlogComment tipini genişletiyoruz (mevcut tipin üzerine eklemeler yapıyoruz)
interface ExtendedBlogComment extends BlogComment {
  likes?: string[]; // beğenen kullanıcı ID listesi
  userId?: string;  // yorumu yazan kullanıcı ID'si
  userName?: string; // yorumu yazan kullanıcı adı
  userAvatar?: string; // yorumu yazan kullanıcı profil resmi
}

interface CommentItemProps {
  comment: ExtendedBlogComment; // BlogComment yerine ExtendedBlogComment kullanıyoruz
  replies?: ExtendedBlogComment[];
  postId: string;
  onCommentSubmit?: () => void;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies = [],
  postId,
  onCommentSubmit,
  isReply = false,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    // user?.id vs comment.likes null kontrolleri ekledik
    return user ? (comment.likes || []).includes(user.id || '') : false;
  });
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Yoruma beğeni ekle/kaldır
  const handleLike = async () => {
    if (!user) return;
    
    try {
      const newIsLiked = !isLiked;
      // Optimistik UI güncellemesi
      setIsLiked(newIsLiked);
      setLikesCount((prevCount: number) => newIsLiked ? prevCount + 1 : prevCount - 1);
      
      // API çağrısı
      await likeComment(comment.id as string, user.id || '');
    } catch (error) {
      // Hata durumunda geri al
      setIsLiked(!isLiked);
      setLikesCount(comment.likes?.length || 0);
      console.error('Beğeni işlemi başarısız oldu:', error);
    }
  };
  
  // Yorumu sil
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      await deleteComment(comment.id as string);
      
      // Silme işlemi başarılı olduğunda yorumları yeniden yükle
      if (onCommentSubmit) {
        onCommentSubmit();
      }
    } catch (error) {
      console.error('Yorum silme işlemi başarısız oldu:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Kullanıcı yorumun sahibi mi?
  const isAuthor = user && comment.userId && user.id === comment.userId;
  
  // Kullanıcı admin mi? (Bu kısmı kendi mantığınıza göre düzenleyebilirsiniz)
  const isAdmin = false; // Örnek olarak false verdim, gerçek uygulamada admin kontrolü yapılabilir
  
  // Yorumu silme yetkisi var mı?
  const canDelete = isAuthor || isAdmin;
  
  return (
    <FadeIn direction="up" duration={0.3} className={`${isReply ? 'ml-10 mt-4' : ''}`}>
      <div className="relative">
        {/* Yorum içeriği */}
        <Card className={`p-4 border ${isReply ? 'border-border/50' : 'border-border'}`}>
          {/* Yorum başlığı - Kullanıcı bilgileri ve tarih */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {comment.userAvatar ? (
                <Image
                  src={comment.userAvatar}
                  alt={comment.userName || 'Kullanıcı'}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {(comment.userName || 'K')[0].toUpperCase()}
                </div>
              )}
              
              <div className="ml-2">
                <div className="font-medium">{comment.userName || 'Anonim'}</div>
                <div className="text-xs text-foreground/60">
                  {formatRelativeTime(comment.createdAt)}
                </div>
              </div>
            </div>
            
            {/* Yorum katlama ve diğer işlemler */}
            <div className="flex items-center space-x-1">
              {canDelete && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowDeleteConfirm(true)}
                  aria-label="Yorumu sil"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </Button>
              )}
              
              {!isReply && replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Yanıtları gizle' : 'Yanıtları göster'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={isExpanded ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}></path>
                  </svg>
                </Button>
              )}
            </div>
          </div>
          
          {/* Yorum içeriği */}
          <div className="text-foreground mb-3 whitespace-pre-line">{comment.content}</div>
          
          {/* Yorum alt bilgisi - Beğeni ve yanıtla butonları */}
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-1 text-foreground/60 hover:text-foreground transition-colors ${
                isLiked ? 'text-primary font-medium' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              <span>{likesCount}</span>
            </button>
            
            {!isReply && user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center space-x-1 text-foreground/60 hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
                </svg>
                <span>Yanıtla</span>
              </button>
            )}
          </div>
          
          {/* Silme onay mesajı */}
          {showDeleteConfirm && (
            <Motion
              initial={{ opacity: 0, transform: 'translateY(-10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0)' }}
              className="mt-3 border-t pt-3"
            >
              <Alert
                variant="warning"
                title="Yorumu silmek istediğinize emin misiniz?"
                className="mb-2"
              >
                Bu işlem geri alınamaz.
              </Alert>
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  İptal
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  Sil
                </Button>
              </div>
            </Motion>
          )}
        </Card>
        
        {/* Yanıt formu */}
        {isReplying && (
          <Motion
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <CommentForm
              postId={postId}
              parentId={comment.id as string}
              onCommentSubmit={() => {
                setIsReplying(false);
                onCommentSubmit?.();
              }}
              onCancel={() => setIsReplying(false)}
              autoFocus
              isReply
            />
          </Motion>
        )}
        
        {/* Yanıtlar */}
        {!isReply && replies.length > 0 && isExpanded && (
          <div className="mt-3 relative">
            {/* Yanıtları birleştiren sol dikey çizgi */}
            <div className="absolute h-full w-0.5 bg-border left-5 top-0"></div>
            
            <Motion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentSubmit={onCommentSubmit}
                  isReply
                />
              ))}
            </Motion>
          </div>
        )}
      </div>
    </FadeIn>
  );
};