// src/lib/interaction-service.ts
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument, 
  queryCollection 
} from '@/lib/firebase-service';
import { getServerTimestamp, generateId } from '@/lib/utils';
import { Interaction, Like, Save, View, Share, InteractionStats } from '@/types/interaction';
import { getUserProfile } from '@/lib/user-service';
import { getBlogPostById } from '@/lib/blog-service';
import { createNotification } from '@/lib/notification-service';

// Koleksiyon adları
const INTERACTION_COLLECTION = 'interactions';
const STATS_COLLECTION = 'interaction_stats';

// Etkileşim oluşturma/güncelleme için genel fonksiyon
const setInteraction = async <T extends Interaction>(
  userId: string,
  contentId: string,
  contentType: T['contentType'],
  interactionType: T['interactionType'],
  extraData: Partial<T> = {}
): Promise<string> => {
  // Önce mevcut etkileşimi kontrol edelim
  const existingInteraction = await getInteraction(
    userId, 
    contentId, 
    contentType, 
    interactionType
  );
  
  // Eğer zaten varsa, güncelle ve mevcut ID'yi döndür
  if (existingInteraction) {
    await updateDocument(
      INTERACTION_COLLECTION, 
      existingInteraction.id as string, 
      {
        ...extraData,
        updatedAt: getServerTimestamp()
      }
    );
    return existingInteraction.id as string;
  }
  
  // Yeni bir etkileşim oluştur
  const interactionId = generateId(20);
  const timestamp = getServerTimestamp();
  
  const interaction: Interaction = {
    id: interactionId,
    userId,
    contentId,
    contentType,
    interactionType,
    createdAt: timestamp,
    ...extraData
  };
  
  await setDocument(INTERACTION_COLLECTION, interactionId, interaction);
  
  // İstatistikleri güncelle
  await updateInteractionStats(contentId, contentType, interactionType, 1);
  
  // Bildirim oluştur (beğeni için)
  if (interactionType === 'like') {
    await createLikeNotification(userId, contentId, contentType);
  }
  
  return interactionId;
};

// Beğeni bildirimini oluştur
const createLikeNotification = async (
  userId: string,
  contentId: string,
  contentType: string
) => {
  try {
    // Kullanıcı profilini al
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return;

    let recipientId = '';
    let contentTitle = '';
    let contentLink = '';

    // İçerik tipine göre içerik sahibini ve detayları al
    if (contentType === 'blog_post') {
      const post = await getBlogPostById(contentId);
      if (!post) return;
      
      // Kendi beğenilerinde bildirim oluşturma
      if (post.author.id === userId) return;
      
      recipientId = post.author.id;
      contentTitle = post.title;
      contentLink = `/blog/${post.slug}`;
    } else if (contentType === 'comment') {
      // Yorum için gerekli servisleri ekle
      // const comment = await getCommentById(contentId);
      // if (!comment) return;
      // 
      // if (comment.userId === userId) return;
      // 
      // recipientId = comment.userId;
      // const post = await getBlogPostById(comment.postId);
      // contentTitle = post ? post.title : 'bir yazı';
      // contentLink = post ? `/blog/${post.slug}#comment-${comment.id}` : '';
      
      // Şimdilik yorum beğenilerini atla
      return;
    }

    if (!recipientId) return;

    // Bildirim oluştur
    await createNotification({
      recipientId,
      senderId: userId,
      senderName: userProfile.displayName,
      senderPhoto: userProfile.photoURL || undefined,
      type: 'like',
      contentId,
      contentType,
      title: 'Yeni Beğeni',
      message: `${userProfile.displayName} "${contentTitle}" başlıklı içeriğinizi beğendi.`,
      link: contentLink,
      status: 'unread'
    });
  } catch (error) {
    console.error('Like bildirimi oluşturulurken hata:', error);
  }
};

// Etkileşim bul
const getInteraction = async <T extends Interaction>(
  userId: string,
  contentId: string,
  contentType: string, 
  interactionType: string
): Promise<T | null> => {
  const result = await queryCollection<T>({
    collectionPath: INTERACTION_COLLECTION,
    conditions: [
      { field: 'userId', operator: '==', value: userId },
      { field: 'contentId', operator: '==', value: contentId },
      { field: 'contentType', operator: '==', value: contentType },
      { field: 'interactionType', operator: '==', value: interactionType }
    ],
    limitCount: 1
  });
  
  return result.data.length > 0 ? result.data[0] : null;
};

// Etkileşim sil
const deleteInteraction = async (
  userId: string,
  contentId: string,
  contentType: string,
  interactionType: string
): Promise<boolean> => {
  try {
    const interaction = await getInteraction(userId, contentId, contentType, interactionType);
    
    if (!interaction) {
      return false;
    }
    
    await deleteDocument(INTERACTION_COLLECTION, interaction.id as string);
    
    // İstatistikleri güncelle
    await updateInteractionStats(contentId, contentType, interactionType, -1);
    
    return true;
  } catch (error) {
    console.error('Etkileşim silinirken hata:', error);
    return false;
  }
};

// İstatistikleri güncelle
const updateInteractionStats = async (
  contentId: string,
  contentType: string,
  interactionType: string,
  change: number
): Promise<void> => {
  const statsId = `${contentType}_${contentId}`;
  
  try {
    // Mevcut istatistikleri al
    const stats = await getDocument<InteractionStats>(STATS_COLLECTION, statsId);
    
    if (stats) {
      // Mevcut istatistikleri güncelle
      const update: Partial<InteractionStats> = {};
      
      if (interactionType === 'like') {
        update.likeCount = Math.max(0, (stats.likeCount || 0) + change);
      } else if (interactionType === 'save') {
        update.saveCount = Math.max(0, (stats.saveCount || 0) + change);
      } else if (interactionType === 'view') {
        update.viewCount = Math.max(0, (stats.viewCount || 0) + change);
      } else if (interactionType === 'share') {
        update.shareCount = Math.max(0, (stats.shareCount || 0) + change);
      }
      
      await updateDocument(STATS_COLLECTION, statsId, update);
    } else {
      // Yeni istatistik oluştur
      const newStats: InteractionStats = {
        likeCount: interactionType === 'like' ? 1 : 0,
        saveCount: interactionType === 'save' ? 1 : 0,
        viewCount: interactionType === 'view' ? 1 : 0,
        shareCount: interactionType === 'share' ? 1 : 0
      };
      
      await setDocument(STATS_COLLECTION, statsId, newStats);
    }
  } catch (error) {
    console.error('İstatistikler güncellenirken hata:', error);
  }
};

// İstatistikleri alma
const getInteractionStats = async (
  contentId: string,
  contentType: string
): Promise<InteractionStats> => {
  const statsId = `${contentType}_${contentId}`;
  
  try {
    const stats = await getDocument<InteractionStats>(STATS_COLLECTION, statsId);
    
    if (stats) {
      return stats;
    }
    
    // Yoksa varsayılan dönüş
    return {
      likeCount: 0,
      saveCount: 0,
      viewCount: 0,
      shareCount: 0
    };
  } catch (error) {
    console.error('İstatistikler alınırken hata:', error);
    
    return {
      likeCount: 0,
      saveCount: 0,
      viewCount: 0,
      shareCount: 0
    };
  }
};

// Kullanıcının etkileşim durumunu kontrol et
const checkUserInteraction = async (
  userId: string,
  contentId: string,
  contentType: string,
  interactionType: string
): Promise<boolean> => {
  const interaction = await getInteraction(userId, contentId, contentType, interactionType);
  return !!interaction;
};

// Beğeni ekleme/kaldırma
const toggleLike = async (
  userId: string,
  contentId: string,
  contentType: 'blog_post' | 'comment'
): Promise<{ liked: boolean; count: number }> => {
  try {
    // Önce mevcut durumu kontrol et
    const isLiked = await checkUserInteraction(userId, contentId, contentType, 'like');
    
    if (isLiked) {
      // Beğeniyi kaldır
      await deleteInteraction(userId, contentId, contentType, 'like');
    } else {
      // Beğeni ekle
      await setInteraction<Like>(userId, contentId, contentType, 'like');
    }
    
    // Güncel beğeni sayısını al
    const stats = await getInteractionStats(contentId, contentType);
    
    return {
      liked: !isLiked,
      count: stats.likeCount
    };
  } catch (error) {
    console.error('Beğeni işlemi sırasında hata:', error);
    throw error;
  }
};

// Kaydetme ekleme/kaldırma
const toggleSave = async (
  userId: string,
  contentId: string,
  contentType: 'blog_post' | 'comment',
  collections: string[] = []
): Promise<{ saved: boolean; count: number }> => {
  try {
    // Önce mevcut durumu kontrol et
    const isSaved = await checkUserInteraction(userId, contentId, contentType, 'save');
    
    if (isSaved) {
      // Kaydı kaldır
      await deleteInteraction(userId, contentId, contentType, 'save');
    } else {
      // Kaydet
      await setInteraction<Save>(
        userId, 
        contentId, 
        contentType, 
        'save', 
        { collections }
      );
    }
    
    // Güncel kaydetme sayısını al
    const stats = await getInteractionStats(contentId, contentType);
    
    return {
      saved: !isSaved,
      count: stats.saveCount
    };
  } catch (error) {
    console.error('Kaydetme işlemi sırasında hata:', error);
    throw error;
  }
};

// Görüntülenme ekleme
const addView = async (
  userId: string,
  contentId: string,
  contentType: 'blog_post',
  duration?: number
): Promise<number> => {
  try {
    // Daha önce görüntüledi mi kontrolü yap
    const hasViewed = await checkUserInteraction(userId, contentId, contentType, 'view');
    
    // Daha önce görüntülenmediyse ekle
    if (!hasViewed) {
      await setInteraction<View>(
        userId, 
        contentId, 
        contentType, 
        'view', 
        { duration }
      );
    }
    
    // Güncel görüntülenme sayısını al
    const stats = await getInteractionStats(contentId, contentType);
    
    return stats.viewCount;
  } catch (error) {
    console.error('Görüntülenme eklenirken hata:', error);
    return 0;
  }
};

// Paylaşım ekleme
const addShare = async (
  userId: string,
  contentId: string,
  contentType: 'blog_post',
  platform?: string
): Promise<number> => {
  try {
    await setInteraction<Share>(
      userId, 
      contentId, 
      contentType, 
      'share', 
      { platform }
    );
    
    // Güncel paylaşım sayısını al
    const stats = await getInteractionStats(contentId, contentType);
    
    return stats.shareCount;
  } catch (error) {
    console.error('Paylaşım eklenirken hata:', error);
    return 0;
  }
};

// Kullanıcının beğendiği içerikleri getir
const getUserLikes = async (
  userId: string,
  contentType?: 'blog_post' | 'comment'
): Promise<string[]> => {
  try {
    const conditions = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'interactionType', operator: '==', value: 'like' }
    ];
    
    if (contentType) {
      conditions.push({ field: 'contentType', operator: '==', value: contentType });
    }
    
    const result = await queryCollection<Like>({
      collectionPath: INTERACTION_COLLECTION,
      conditions,
      limitCount: 100
    });
    
    return result.data.map(like => like.contentId);
  } catch (error) {
    console.error('Kullanıcı beğenileri alınırken hata:', error);
    return [];
  }
};

// Kullanıcının kaydettiği içerikleri getir
const getUserSaves = async (
  userId: string,
  contentType?: 'blog_post' | 'comment'
): Promise<string[]> => {
  try {
    const conditions = [
      { field: 'userId', operator: '==', value: userId },
      { field: 'interactionType', operator: '==', value: 'save' }
    ];
    
    if (contentType) {
      conditions.push({ field: 'contentType', operator: '==', value: contentType });
    }
    
    const result = await queryCollection<Save>({
      collectionPath: INTERACTION_COLLECTION,
      conditions,
      limitCount: 100
    });
    
    return result.data.map(save => save.contentId);
  } catch (error) {
    console.error('Kullanıcı kayıtları alınırken hata:', error);
    return [];
  }
};

export {
  toggleLike,
  toggleSave,
  addView,
  addShare,
  checkUserInteraction,
  getInteractionStats,
  getUserLikes,
  getUserSaves
};