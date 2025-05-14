// src/lib/comment-service-extension.ts
import { 
  createComment as originalCreateComment
} from '@/lib/blog-service';
import { BlogComment } from '@/types/blog';
import { createNotification } from '@/lib/notification-service';
import { getBlogPostById } from '@/lib/blog-service';
import { getUserProfile } from '@/lib/user-service';

// Yorum ekleme ve bildirim gönderme
export const createComment = async (comment: Omit<BlogComment, 'id' | 'createdAt'>) => {
  // Orijinal yorum ekleme fonksiyonunu çağır
  const commentId = await originalCreateComment(comment);
  
  try {
    // Blog yazısını ve yazarını al
    const blogPost = await getBlogPostById(comment.postId);
    
    if (blogPost && blogPost.author.id !== comment.author.id) {
      // Yorum yapan kullanıcı bilgilerini al
      const commenter = await getUserProfile(comment.author.id);
      
      if (commenter) {
        // Blog yazarına bildirim gönder
        await createNotification({
          recipientId: blogPost.author.id,
          senderId: commenter.id,
          senderName: commenter.displayName,
          senderPhoto: commenter.photoURL || undefined,
          type: 'comment',
          contentId: blogPost.id as string,
          contentType: 'blog_post',
          title: 'Yeni Yorum',
          message: `${commenter.displayName} "${blogPost.title}" başlıklı yazınıza yorum yaptı.`,
          link: `/blog/${blogPost.slug}#comment-${commentId}`,
          status: 'unread'
        });
      }
    }
    
    // Yanıt kontrolü yap
    if (comment.parentId) {
      // Bu bir yanıt yorumu
      // İlgili üst yorumun sahibine bildirim gönder
      // Bu kısım geliştirilebilir
    }
  } catch (error) {
    console.error('Yorum bildirimi oluşturulurken hata:', error);
    // Ana işlem başarılı olduğu için hata fırlatma
  }
  
  return commentId;
};