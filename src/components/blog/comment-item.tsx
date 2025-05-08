// src/components/blog/comment-item.tsx

'use client';

import React, { useState } from 'react';
// Kullanılmayan importları kaldırdım
// import { format } from 'date-fns';
// import { tr } from 'date-fns/locale';
import { CommentForm } from '@/components/blog/comment-form';
import { BlogComment } from '@/types/blog';
import { useAuth } from '@/context/auth-context';
import { formatRelativeTime } from '@/lib/utils';
import Image from 'next/image'; // Image bileşenini ekledim

interface CommentItemProps {
  comment: BlogComment;
  replies?: BlogComment[];
  postId: string;
  onCommentSubmit: (comment: BlogComment) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  replies = [], 
  postId,
  onCommentSubmit
}) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySubmit = (newComment: BlogComment) => {
    onCommentSubmit(newComment);
    setShowReplyForm(false);
  };

  return (
    <div>
      <div className="p-4 bg-card rounded-lg border border-border">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {comment.author.avatar ? (
            <Image 
              src={comment.author.avatar} 
              alt={comment.author.name} 
              width={40} 
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              {comment.author.name[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium">{comment.author.name}</h4>
              <span className="text-sm text-foreground/60">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {comment.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            
            {user && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-primary font-medium mt-2"
              >
                {showReplyForm ? 'İptal' : 'Yanıtla'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Yanıt formu */}
      {showReplyForm && (
        <div className="ml-12 mt-2">
          <CommentForm 
            postId={postId} 
            parentId={comment.id} 
            onCommentSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Yanıtlar */}
      {replies.length > 0 && (
        <div className="ml-12 mt-2 space-y-2">
          {replies.map(reply => (
            <div key={reply.id} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {reply.author.avatar ? (
                  <Image 
                    src={reply.author.avatar} 
                    alt={reply.author.name} 
                    width={32} 
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm">
                    {reply.author.name[0].toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-sm">{reply.author.name}</h4>
                    <span className="text-xs text-foreground/60">
                      {formatRelativeTime(reply.createdAt)}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {reply.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};