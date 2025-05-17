// src/components/blog/comment-form.tsx
'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
// blog-service'ten addComment fonksiyonunu import etmek yerine, stub bir fonksiyon oluşturacağız
// import { addComment } from '@/lib/blog-service';
import Image from 'next/image';
import { Motion } from '@/components/ui/motion';

// Yorum verisi için tip tanımı
interface CommentData {
  postId: string;
  parentId?: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
}

// Geçici stub fonksiyon - blog-service'ten addComment fonksiyonu gelene kadar kullanılacak
const addComment = async (commentData: CommentData): Promise<void> => {
  console.log("Yorum ekleme isteği:", commentData);
  // Gerçek uygulamada burada bir API çağrısı yapılacak
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Yorum başarıyla eklendi (simülasyon)");
      resolve();
    }, 500);
  });
};

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onCommentSubmit?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  isReply?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentId,
  onCommentSubmit,
  onCancel,
  autoFocus = false,
  isReply = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Textarea otomatik boyut ayarlama fonksiyonu
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Textarea değiştiğinde çağrılacak fonksiyon
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight(e.target);
  };

  // Textarea focus veya blur olduğunda çağrılacak fonksiyonlar
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!content.trim()) {
      setIsFocused(false);
    }
  };

  // autoFocus prop'u verilirse, component monte edildiğinde otomatik olarak focuslanacak
  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Yorum gönderme fonksiyonu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kullanıcı kontrolü
    if (!user) {
      setError('Yorum yapmak için giriş yapmalısınız');
      return;
    }
    
    // Boş yorum kontrolü
    if (!content.trim()) {
      setError('Yorum boş olamaz');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addComment({
        postId,
        parentId,
        content,
        userId: user.id as string, // uid yerine id kullanıyoruz
        userName: user.displayName as string,
        userAvatar: user.photoURL as string,
      });
      
      setContent('');
      setIsFocused(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Yorum ekleme başarılı olduğunda callback fonksiyonunu çağır
      onCommentSubmit?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Yorum gönderilirken bir hata oluştu');
      } else {
        setError('Yorum gönderilirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`comment-form ${isReply ? 'ml-10 mb-4' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'Kullanıcı'}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.displayName?.[0]?.toUpperCase() || 'K'}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className={`transition-all duration-300 ${isFocused ? 'mb-4' : 'mb-0'}`}>
              <div className={`relative border ${isFocused ? 'border-primary/50 rounded-lg shadow-sm' : 'border-border rounded-full'} transition-all duration-300`}>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextareaChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={isReply ? "Yanıtınızı yazın..." : "Yorumunuzu yazın..."}
                  className="w-full py-2 px-4 bg-transparent resize-none overflow-hidden min-h-[42px] max-h-60 focus:outline-none rounded-lg"
                  rows={1}
                  disabled={loading}
                />
              </div>
              
              {error && (
                <Motion
                  initial={{ opacity: 0, transform: 'translateY(-10px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0)' }}
                  className="text-error text-sm mt-1"
                >
                  {error}
                </Motion>
              )}
            </div>
            
            {isFocused && (
              <Motion
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex justify-end space-x-2"
              >
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setContent('');
                      setIsFocused(false);
                      onCancel();
                    }}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="sm"
                  isLoading={loading}
                  disabled={!content.trim() || loading}
                >
                  {isReply ? 'Yanıtla' : 'Yorum Yap'}
                </Button>
              </Motion>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};