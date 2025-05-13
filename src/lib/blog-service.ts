// src/lib/blog-service.ts

import { getServerTimestamp, generateId } from '@/lib/utils';
import { 
  getDocument, 
  setDocument, 
  queryCollection, 
  updateDocument, 
  deleteDocument,
  uploadFile
} from '@/lib/firebase-service';
import { BlogPost, BlogComment, Category } from '@/types/blog';
import { QueryDocumentSnapshot } from 'firebase/firestore';

const BLOG_COLLECTION = 'blog_posts';
const COMMENT_COLLECTION = 'blog_comments';
const CATEGORY_COLLECTION = 'categories';

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
  categoryId = null,
  featured = false,
  perPage = 10,
  startAfterDoc = null
}: {
  status?: 'published' | 'draft' | 'all';
  tag?: string;
  categoryId?: string | null;
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
  
  // Kategoriye göre filtrele
  if (categoryId) {
    conditions.push({ field: 'categoryId', operator: '==', value: categoryId });
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

// Tüm yorumları listeleme (eklenen yeni fonksiyon)
export const getComments = async (
  status: 'all' | 'pending' | 'approved' | 'rejected' = 'all'
): Promise<BlogComment[]> => {
  const conditions = [];
  
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

// Blog içi resim yükleme
export const uploadBlogImage = async (file: File, postId: string): Promise<string> => {
  const fileName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
  const path = `blog_images/${postId}/content/${fileName}`;
  return uploadFile(path, file);
};

// Kategori Fonksiyonları //

// Kategori oluşturma
export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const timestamp = getServerTimestamp();
  
  // Slug yoksa isimden oluştur
  if (!category.slug) {
    category.slug = generateSlug(category.name);
  }
  
  // Benzersiz bir ID oluştur
  const docId = generateId(20);
  
  const newCategory: Category = {
    ...category,
    id: docId,
    createdAt: timestamp,
    updatedAt: timestamp,
    parentId: category.parentId || null,
    order: category.order || 0
  };
  
  await setDocument(CATEGORY_COLLECTION, docId, newCategory);
  return docId;
};

// Kategori güncelleme
export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  const timestamp = getServerTimestamp();
  
  // İsim değiştiyse ve slug özellikle değiştirilmediyse, yeni slug oluştur
  if (category.name && !category.slug) {
    category.slug = generateSlug(category.name);
  }
  
  await updateDocument(CATEGORY_COLLECTION, id, {
    ...category,
    updatedAt: timestamp
  });
};

// Kategori silme
export const deleteCategory = async (id: string): Promise<void> => {
  // Önce bu kategoriye ait blog yazılarını kontrol et
  // Eğer blog yazıları varsa onları uncategorized yapabilir veya hata döndürebilirsiniz
  const posts = await queryCollection<BlogPost>({
    collectionPath: BLOG_COLLECTION,
    conditions: [{ field: 'categoryId', operator: '==', value: id }],
    limitCount: 1
  });
  
  if (posts.data.length > 0) {
    throw new Error('Bu kategori blog yazıları tarafından kullanılıyor. Önce blog yazılarını başka bir kategoriye taşıyın.');
  }
  
  // Alt kategorileri kontrol et
  const subCategories = await queryCollection<Category>({
    collectionPath: CATEGORY_COLLECTION,
    conditions: [{ field: 'parentId', operator: '==', value: id }],
    limitCount: 1
  });
  
  if (subCategories.data.length > 0) {
    throw new Error('Bu kategorinin alt kategorileri bulunuyor. Önce alt kategorileri silin veya başka bir kategoriye taşıyın.');
  }
  
  // Kategoriyi sil
  await deleteDocument(CATEGORY_COLLECTION, id);
};

// Kategoriyi ID ile alma
export const getCategoryById = async (id: string): Promise<Category | null> => {
  return getDocument<Category>(CATEGORY_COLLECTION, id);
};

// Kategoriyi slug ile alma
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const result = await queryCollection<Category>({
    collectionPath: CATEGORY_COLLECTION,
    conditions: [{ field: 'slug', operator: '==', value: slug }],
    limitCount: 1
  });
  
  return result.data.length > 0 ? result.data[0] : null;
};

// Tüm kategorileri listeleme
export const getCategories = async (parentId?: string | null): Promise<Category[]> => {
  const conditions = [];
  
  // Eğer parentId belirtilmişse, sadece belirli bir kategorinin alt kategorilerini getir
  if (parentId !== undefined) {
    conditions.push({
      field: 'parentId',
      operator: '==',
      value: parentId
    });
  }
  
  const result = await queryCollection<Category>({
    collectionPath: CATEGORY_COLLECTION,
    conditions,
    orderByField: 'order',
    orderDirection: 'asc',
    limitCount: 100
  });
  
  return result.data;
};

// Hiyerarşik kategorileri alma
export const getCategoryHierarchy = async (): Promise<Category[]> => {
  // Tüm kategorileri getir
  const allCategories = await getCategories(undefined);
  
  // Kategorileri parentId'ye göre grupla
  const categoriesByParent: Record<string, Category[]> = {};
  
  allCategories.forEach(category => {
    const parentId = category.parentId || 'root';
    if (!categoriesByParent[parentId]) {
      categoriesByParent[parentId] = [];
    }
    categoriesByParent[parentId].push(category);
  });
  
  // Sıralanmış kök kategoriler
  return categoriesByParent['root'] || [];
};

// Belirli bir kategorinin alt kategorilerini alma
export const getSubCategories = async (categoryId: string): Promise<Category[]> => {
  return getCategories(categoryId);
};

// Blog yazısının kategorisini ayarlama
export const setCategoryForPost = async (postId: string, categoryId: string | null): Promise<void> => {
  await updateDocument<BlogPost>(BLOG_COLLECTION, postId, {
    categoryId
  });
};

// Belirli bir kategorideki blog yazılarını alma
export const getBlogPostsByCategory = async (
  categoryId: string,
  options: {
    status?: 'published' | 'draft' | 'all';
    perPage?: number;
    startAfterDoc?: QueryDocumentSnapshot<BlogPost> | null;
  } = {}
): Promise<{ posts: BlogPost[]; lastDoc: QueryDocumentSnapshot<BlogPost> | null; hasMore: boolean }> => {
  const { status = 'published', perPage = 10, startAfterDoc = null } = options;
  
  const conditions = [
    { field: 'categoryId', operator: '==', value: categoryId }
  ];
  
  if (status !== 'all') {
    conditions.push({ field: 'status', operator: '==', value: status });
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

// İstatistikleri getiren fonksiyon
export const getBlogStats = async (): Promise<{
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  pendingComments: number;
  totalCategories: number;
  totalTags: number;
  totalViews: number;
}> => {
  try {
    // Tüm blog yazılarını getir (statüye göre filtrelemeden)
    const allPosts = await queryCollection<BlogPost>({
      collectionPath: BLOG_COLLECTION,
      limitCount: 1000,
    });
    
    // Yayınlanan blog yazılarını getir
    const publishedPosts = allPosts.data.filter(post => post.status === 'published');
    
    // Taslak blog yazılarını getir
    const draftPosts = allPosts.data.filter(post => post.status === 'draft');
    
    // Toplam görüntülenme sayısı
    const totalViews = allPosts.data.reduce((sum, post) => sum + (post.viewCount || 0), 0);
    
    // Tüm yorumları getir
    const allComments = await getComments();
    
    // Onay bekleyen yorumlar
    const pendingComments = allComments.filter(comment => comment.status === 'pending');
    
    // Tüm kategorileri getir
    const allCategories = await getCategories();
    
    // Tüm etiketleri getir
    const allTags = await getBlogTags();
    
    return {
      totalPosts: allPosts.data.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalComments: allComments.length,
      pendingComments: pendingComments.length,
      totalCategories: allCategories.length,
      totalTags: allTags.length,
      totalViews: totalViews
    };
  } catch (error) {
    console.error('Blog istatistikleri getirilirken hata oluştu:', error);
    
    // Hata durumunda varsayılan değerler döndür
    return {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalComments: 0,
      pendingComments: 0,
      totalCategories: 0,
      totalTags: 0,
      totalViews: 0
    };
  }
};