// src/lib/collection-service.ts
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument, 
  queryCollection 
} from '@/lib/firebase-service';
import { Collection, CollectionItem } from '@/types/collection';
import { BlogPost } from '@/types/blog';
import { getBlogPostById } from '@/lib/blog-service';
import { generateId } from '@/lib/utils';
import { Save } from '@/types/interaction';
import { toggleSave } from '@/lib/interaction-service';

// Koleksiyon adları
const COLLECTION_COLLECTION = 'collections';
const COLLECTION_ITEM_COLLECTION = 'collection_items';
const INTERACTIONS_COLLECTION = 'interactions';

// Koleksiyon oluşturma
export async function createCollection(
  userId: string,
  name: string,
  description?: string,
  isPrivate: boolean = false,
  coverImage?: string | null
): Promise<string> {
  try {
    const id = generateId(20);
    const timestamp = Date.now();
    
    const collection: Collection = {
      id,
      userId,
      name,
      description,
      coverImage: coverImage || null,
      isPrivate,
      itemCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await setDocument(COLLECTION_COLLECTION, id, collection);
    return id;
  } catch (error) {
    console.error('Koleksiyon oluşturulurken hata:', error);
    throw error;
  }
}

// Koleksiyon güncelleme
export async function updateCollection(
  collectionId: string,
  updates: Partial<Collection>
): Promise<void> {
  try {
    const collection = await getDocument<Collection>(COLLECTION_COLLECTION, collectionId);
    
    if (!collection) {
      throw new Error('Koleksiyon bulunamadı');
    }
    
    // Güncellenme zamanını ekle
    const updatedFields = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDocument(COLLECTION_COLLECTION, collectionId, updatedFields);
  } catch (error) {
    console.error('Koleksiyon güncellenirken hata:', error);
    throw error;
  }
}

// Koleksiyon silme
export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    // Önce koleksiyona ait tüm öğeleri bul
    const items = await getCollectionItems(collectionId);
    
    // Öğeleri sil
    for (const item of items) {
      await deleteCollectionItem(item.id as string);
    }
    
    // Koleksiyonu sil
    await deleteDocument(COLLECTION_COLLECTION, collectionId);
  } catch (error) {
    console.error('Koleksiyon silinirken hata:', error);
    throw error;
  }
}

// Koleksiyon getirme
export async function getCollection(collectionId: string): Promise<Collection | null> {
  try {
    return await getDocument<Collection>(COLLECTION_COLLECTION, collectionId);
  } catch (error) {
    console.error('Koleksiyon getirilirken hata:', error);
    return null;
  }
}

// Kullanıcının koleksiyonlarını getirme
export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    const result = await queryCollection<Collection>({
      collectionPath: COLLECTION_COLLECTION,
      conditions: [{ field: 'userId', operator: '==', value: userId }],
      orderByField: 'updatedAt',
      orderDirection: 'desc'
    });
    
    return result.data;
  } catch (error) {
    console.error('Kullanıcı koleksiyonları getirilirken hata:', error);
    return [];
  }
}

// Koleksiyona içerik ekleme
export async function addToCollection(
  userId: string,
  collectionId: string,
  contentId: string,
  contentType: 'blog_post' | 'comment',
  notes?: string
): Promise<string> {
  try {
    // Koleksiyonu kontrol et
    const collection = await getCollection(collectionId);
    
    if (!collection) {
      throw new Error('Koleksiyon bulunamadı');
    }
    
    // Kullanıcının yetkisi var mı kontrol et
    if (collection.userId !== userId) {
      throw new Error('Bu koleksiyon üzerinde yetkiniz yok');
    }
    
    // Önce içeriğin koleksiyonda olup olmadığını kontrol et
    const existingItem = await getCollectionItemByContent(collectionId, contentId);
    
    if (existingItem) {
      // Eğer zaten koleksiyondaysa, notları güncelle
      if (notes) {
        await updateDocument(COLLECTION_ITEM_COLLECTION, existingItem.id as string, {
          notes,
          addedAt: Date.now() // Ekleme tarihini güncelle
        });
      }
      
      return existingItem.id as string;
    }
    
    // Yeni koleksiyon öğesi oluştur
    const id = generateId(20);
    const timestamp = Date.now();
    
    const collectionItem: CollectionItem = {
      id,
      collectionId,
      contentId,
      contentType,
      addedAt: timestamp,
      notes
    };
    
    await setDocument(COLLECTION_ITEM_COLLECTION, id, collectionItem);
    
    // Koleksiyondaki öğe sayısını güncelle
    await updateCollection(collectionId, {
      itemCount: (collection.itemCount || 0) + 1
    });
    
    // İçeriği "save" olarak işaretle (eğer zaten kaydedilmemişse)
    const saveInteraction = await queryCollection<Save>({
      collectionPath: INTERACTIONS_COLLECTION,
      conditions: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'contentId', operator: '==', value: contentId },
        { field: 'contentType', operator: '==', value: contentType },
        { field: 'interactionType', operator: '==', value: 'save' }
      ],
      limitCount: 1
    });
    
    if (saveInteraction.data.length === 0) {
      // Kaydedilmemişse kaydet ve koleksiyon bilgisini ekle
      await toggleSave(userId, contentId, contentType, [collectionId]);
    } else {
      // Zaten kaydedilmişse, koleksiyon bilgisini güncelle
      const save = saveInteraction.data[0];
      const collections = save.collections || [];
      
      if (!collections.includes(collectionId)) {
        await updateDocument(INTERACTIONS_COLLECTION, save.id as string, {
          collections: [...collections, collectionId]
        });
      }
    }
    
    return id;
  } catch (error) {
    console.error('Koleksiyona içerik eklenirken hata:', error);
    throw error;
  }
}

// Koleksiyondan içerik çıkarma
export async function removeFromCollection(
  userId: string,
  collectionId: string,
  contentId: string
): Promise<void> {
  try {
    // Koleksiyonu kontrol et
    const collection = await getCollection(collectionId);
    
    if (!collection) {
      throw new Error('Koleksiyon bulunamadı');
    }
    
    // Kullanıcının yetkisi var mı kontrol et
    if (collection.userId !== userId) {
      throw new Error('Bu koleksiyon üzerinde yetkiniz yok');
    }
    
    // İçeriğin koleksiyonda olup olmadığını kontrol et
    const item = await getCollectionItemByContent(collectionId, contentId);
    
    if (!item) {
      throw new Error('İçerik bu koleksiyonda bulunamadı');
    }
    
    // Koleksiyon öğesini sil
    await deleteDocument(COLLECTION_ITEM_COLLECTION, item.id as string);
    
    // Koleksiyondaki öğe sayısını güncelle
    await updateCollection(collectionId, {
      itemCount: Math.max(0, (collection.itemCount || 0) - 1)
    });
    
    // Save interaction'dan koleksiyon bilgisini güncelle
    const saveInteraction = await queryCollection<Save>({
      collectionPath: INTERACTIONS_COLLECTION,
      conditions: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'contentId', operator: '==', value: contentId },
        { field: 'contentType', operator: '==', value: item.contentType },
        { field: 'interactionType', operator: '==', value: 'save' }
      ],
      limitCount: 1
    });
    
    if (saveInteraction.data.length > 0) {
      const save = saveInteraction.data[0];
      const collections = save.collections || [];
      
      // Koleksiyon listesinden çıkar
      const updatedCollections = collections.filter(id => id !== collectionId);
      
      if (updatedCollections.length === 0) {
        // Eğer başka koleksiyonda yoksa, kaydı tamamen sil
        await deleteDocument(INTERACTIONS_COLLECTION, save.id as string);
      } else {
        // Sadece koleksiyon listesini güncelle
        await updateDocument(INTERACTIONS_COLLECTION, save.id as string, {
          collections: updatedCollections
        });
      }
    }
  } catch (error) {
    console.error('Koleksiyondan içerik çıkarılırken hata:', error);
    throw error;
  }
}

// Koleksiyon içeriğini getir
export async function getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
  try {
    const result = await queryCollection<CollectionItem>({
      collectionPath: COLLECTION_ITEM_COLLECTION,
      conditions: [{ field: 'collectionId', operator: '==', value: collectionId }],
      orderByField: 'addedAt',
      orderDirection: 'desc'
    });
    
    return result.data;
  } catch (error) {
    console.error('Koleksiyon içeriği getirilirken hata:', error);
    return [];
  }
}

// İçeriğe göre koleksiyon öğesi bulma
export async function getCollectionItemByContent(
  collectionId: string,
  contentId: string
): Promise<CollectionItem | null> {
  try {
    const result = await queryCollection<CollectionItem>({
      collectionPath: COLLECTION_ITEM_COLLECTION,
      conditions: [
        { field: 'collectionId', operator: '==', value: collectionId },
        { field: 'contentId', operator: '==', value: contentId }
      ],
      limitCount: 1
    });
    
    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('Koleksiyon öğesi bulunurken hata:', error);
    return null;
  }
}

// Koleksiyon öğesini silme
export async function deleteCollectionItem(itemId: string): Promise<void> {
  try {
    const item = await getDocument<CollectionItem>(COLLECTION_ITEM_COLLECTION, itemId);
    
    if (!item) {
      throw new Error('Koleksiyon öğesi bulunamadı');
    }
    
    // Koleksiyon öğesini sil
    await deleteDocument(COLLECTION_ITEM_COLLECTION, itemId);
    
    // Koleksiyondaki öğe sayısını güncelle
    const collection = await getCollection(item.collectionId);
    
    if (collection) {
      await updateCollection(item.collectionId, {
        itemCount: Math.max(0, (collection.itemCount || 0) - 1)
      });
    }
  } catch (error) {
    console.error('Koleksiyon öğesi silinirken hata:', error);
    throw error;
  }
}

// Koleksiyon içeriğini blog yazıları olarak getir
export async function getCollectionBlogPosts(collectionId: string): Promise<BlogPost[]> {
  try {
    const items = await getCollectionItems(collectionId);
    
    // Sadece blog yazılarını filtrele
    const blogItems = items.filter(item => item.contentType === 'blog_post');
    
    // Blog yazılarının detaylarını getir
    const postPromises = blogItems.map(async (item) => {
      return await getBlogPostById(item.contentId);
    });
    
    const posts = await Promise.all(postPromises);
    
    // null değerleri filtrele ve durumu "published" olanları al
    return posts
      .filter((post): post is BlogPost => !!post)
      .filter(post => post.status === 'published');
  } catch (error) {
    console.error('Koleksiyon blog yazıları getirilirken hata:', error);
    return [];
  }
}

// İçeriğin hangi koleksiyonlarda olduğunu kontrol et
export async function getContentCollections(
  userId: string,
  contentId: string
): Promise<Collection[]> {
  try {
    // Önce kullanıcının tüm koleksiyonlarını getir
    const collections = await getUserCollections(userId);
    
    // Her koleksiyon için içeriğin olup olmadığını kontrol et
    const collectionPromises = collections.map(async (collection) => {
      const item = await getCollectionItemByContent(collection.id as string, contentId);
      return item ? collection : null;
    });
    
    const collectionResults = await Promise.all(collectionPromises);
    
    // null değerleri filtrele
    return collectionResults.filter((collection): collection is Collection => !!collection);
  } catch (error) {
    console.error('İçeriğin koleksiyonları kontrol edilirken hata:', error);
    return [];
  }
}