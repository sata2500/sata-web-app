import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    limit,
    Timestamp,
    DocumentData
  } from 'firebase/firestore';
  import { db } from '@/config/firebase';
  
  // Blog yazısı tipi
  export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    category: string;
    tags: string[];
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    published: boolean;
    featured?: boolean;
  }
  
  // Firestore verilerini BlogPost'a dönüştür
  function convertToPost(doc: DocumentData): BlogPost {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      author: data.author,
      category: data.category,
      tags: data.tags,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      published: data.published,
      featured: data.featured
    };
  }
  
  // Tüm blog yazılarını getir
  export async function getAllPosts(publishedOnly = true): Promise<BlogPost[]> {
    try {
      let postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      );
  
      if (publishedOnly) {
        postsQuery = query(
          postsQuery,
          where('published', '==', true)
        );
      }
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('Blog yazıları alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // Belirli bir kategori/etikete ait yazıları getir
  export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('category', '==', category),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('Kategori yazıları alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // Belirli bir etikete ait yazıları getir
  export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('tags', 'array-contains', tag),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('Etiket yazıları alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // Öne çıkan yazıları getir
  export async function getFeaturedPosts(count = 3): Promise<BlogPost[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('featured', '==', true),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('Öne çıkan yazılar alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // Slug ile yazı getir
  export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('slug', '==', slug),
        where('published', '==', true),
        limit(1)
      );
  
      const snapshot = await getDocs(postsQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      return convertToPost(snapshot.docs[0]);
    } catch (error) {
      console.error('Blog yazısı alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // ID ile yazı getir
  export async function getPostById(id: string): Promise<BlogPost | null> {
    try {
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as BlogPost;
    } catch (error) {
      console.error('Blog yazısı alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // Yazı oluştur
  export async function createPost(post: Omit<BlogPost, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Blog yazısı oluşturulurken hata oluştu:', error);
      throw error;
    }
  }
  
  // Yazı güncelle
  export async function updatePost(id: string, post: Partial<BlogPost>): Promise<void> {
    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, {
        ...post,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Blog yazısı güncellenirken hata oluştu:', error);
      throw error;
    }
  }
  
  // Yazı sil
  export async function deletePost(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'posts', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Blog yazısı silinirken hata oluştu:', error);
      throw error;
    }
  }
  
  // Son blog yazılarını getir
  export async function getRecentPosts(count = 5): Promise<BlogPost[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('Son yazılar alınırken hata oluştu:', error);
      throw error;
    }
  }
  
  // İlgili yazıları getir (aynı kategori/etiketlere sahip)
  export async function getRelatedPosts(post: BlogPost, count = 3): Promise<BlogPost[]> {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('category', '==', post.category),
        where('id', '!=', post.id),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
  
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(convertToPost);
    } catch (error) {
      console.error('İlgili yazılar alınırken hata oluştu:', error);
      throw error;
    }
  }