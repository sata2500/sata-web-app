// src/lib/blog-service.ts

import { getServerTimestamp, generateId } from '@/lib/utils';
import { 
  //getCollectionRef, 
  //getDocRef, 
  getDocument, 
  setDocument, 
  queryCollection, 
  updateDocument, 
  deleteDocument,
  uploadFile,
  //deleteFile
} from '@/lib/firebase-service';
import { BlogPost, BlogComment } from '@/types/blog';
import { QueryDocumentSnapshot } from 'firebase/firestore';

const BLOG_COLLECTION = 'blog_posts';
const COMMENT_COLLECTION = 'blog_comments';

// Slug oluşturma yardımcı fonksiyonu
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Blog yazısı ekleme
export const createBlogPost = async (blogPost: Omit<BlogPost, 'id' | 'publishedAt' | 'updatedAt' | 'viewCount'>): Promise<string> => {
  const timestamp = getServerTimestamp();
  
  // Slug yoksa başlıktan oluştur
  if (!blogPost.slug) {
    blogPost.slug = generateSlug(blogPost.title);
  }
  
  // Benzersiz bir ID oluştur
  const docId = generateId(20); // 20 karakter uzunluğunda bir ID
  
  const newPost: BlogPost = {
    ...blogPost,
    id: docId,
    publishedAt: timestamp,
    updatedAt: timestamp,
    viewCount: 0,
    status: blogPost.status || 'draft',
    featured: blogPost.featured || false
  };
  
  // firebase-service.ts'deki setDocument fonksiyonunu kullan
  await setDocument(BLOG_COLLECTION, docId, newPost);
  return docId;
};

// Blog yazısı güncelleme
export const updateBlogPost = async (id: string, blogPost: Partial<BlogPost>): Promise<void> => {
  const timestamp = getServerTimestamp();
  
  // Başlık değiştiyse ve slug özellikle değiştirilmediyse, yeni slug oluştur
  if (blogPost.title && !blogPost.slug) {
    blogPost.slug = generateSlug(blogPost.title);
  }
  
  await updateDocument(BLOG_COLLECTION, id, {
    ...blogPost,
    updatedAt: timestamp
  });
};

// Blog yazısı silme
export const deleteBlogPost = async (id: string): Promise<void> => {
  // Önce blog yazısına ait yorumları sil
  const comments = await getCommentsByPostId(id);
  const deleteCommentPromises = comments.map(comment => 
    deleteComment(comment.id as string)
  );
  
  await Promise.all(deleteCommentPromises);
  
  // Sonra blog yazısını sil
  await deleteDocument(BLOG_COLLECTION, id);
};

// Blog yazısını ID ile alma
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  return getDocument<BlogPost>(BLOG_COLLECTION, id);
};

// Blog yazısını slug ile alma
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const result = await queryCollection<BlogPost>({
    collectionPath: BLOG_COLLECTION,
    conditions: [{ field: 'slug', operator: '==', value: slug }],
    limitCount: 1
  });
  
  return result.data.length > 0 ? result.data[0] : null;
};

// Blog yazılarını listeleme (sayfalama ve filtreleme ile)
export const getBlogPosts = async ({
  status = 'published',
  tag = '',
  featured = false,
  perPage = 10,
  startAfterDoc = null
}: {
  status?: 'published' | 'draft' | 'all';
  tag?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
  startAfterDoc?: QueryDocumentSnapshot<BlogPost> | null;
}): Promise<{ posts: BlogPost[]; lastDoc: QueryDocumentSnapshot<BlogPost> | null; hasMore: boolean }> => {
  const conditions = [];
  
  // Duruma göre filtrele
  if (status !== 'all') {
    conditions.push({ field: 'status', operator: '==', value: status });
  }
  
  // Etikete göre filtrele
  if (tag) {
    conditions.push({ field: 'tags', operator: 'array-contains', value: tag });
  }
  
  // Öne çıkanlara göre filtrele
  if (featured) {
    conditions.push({ field: 'featured', operator: '==', value: true });
  }
  
  const result = await queryCollection<BlogPost>({
    collectionPath: BLOG_COLLECTION,
    conditions,
    orderByField: 'publishedAt',
    orderDirection: 'desc',
    limitCount: perPage,
    startAfterDoc
  });
  
  // Daha fazla veri olup olmadığını kontrol et
  const nextPageResult = result.lastDoc 
    ? await queryCollection<BlogPost>({
        collectionPath: BLOG_COLLECTION,
        conditions,
        orderByField: 'publishedAt',
        orderDirection: 'desc',
        limitCount: 1,
        startAfterDoc: result.lastDoc
      })
    : { data: [] };
  
  return {
    posts: result.data,
    lastDoc: result.lastDoc,
    hasMore: nextPageResult.data.length > 0
  };
};

// Etiketleri listeleme
export const getBlogTags = async (): Promise<string[]> => {
  const posts = await getBlogPosts({ perPage: 100 });
  
  // Tüm etiketleri topla ve benzersiz yap
  const allTags = posts.posts.reduce((tags, post) => {
    return [...tags, ...post.tags];
  }, [] as string[]);
  
  return [...new Set(allTags)];
};

// Yorum ekleme
export const createComment = async (comment: Omit<BlogComment, 'id' | 'createdAt'>): Promise<string> => {
  const timestamp = getServerTimestamp();
  
  // Benzersiz bir ID oluştur
  const commentId = generateId(20);
  
  const newComment: BlogComment = {
    ...comment,
    id: commentId,
    createdAt: timestamp,
    status: 'pending'
  };
  
  await setDocument(COMMENT_COLLECTION, commentId, newComment);
  return commentId;
};

// Yorum güncelleme
export const updateComment = async (id: string, comment: Partial<BlogComment>): Promise<void> => {
  await updateDocument(COMMENT_COLLECTION, id, comment);
};

// Yorum silme
export const deleteComment = async (id: string): Promise<void> => {
  await deleteDocument(COMMENT_COLLECTION, id);
};

// Yorumu ID ile alma
export const getCommentById = async (id: string): Promise<BlogComment | null> => {
  return getDocument<BlogComment>(COMMENT_COLLECTION, id);
};

// Blog yazısının yorumlarını listeleme
export const getCommentsByPostId = async (
  postId: string,
  status: 'all' | 'pending' | 'approved' | 'rejected' = 'approved'
): Promise<BlogComment[]> => {
  const conditions = [{ field: 'postId', operator: '==', value: postId }];
  
  if (status !== 'all') {
    conditions.push({ field: 'status', operator: '==', value: status });
  }
  
  const result = await queryCollection<BlogComment>({
    collectionPath: COMMENT_COLLECTION,
    conditions,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 100
  });
  
  return result.data;
};

// Blog kapak resmi yükleme
export const uploadBlogCoverImage = async (file: File, postId: string): Promise<string> => {
  const path = `blog_images/${postId}/cover`;
  return uploadFile(path, file);
};