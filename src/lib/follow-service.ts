// src/lib/follow-service.ts
import { 
  getDocument, 
  setDocument, 
  queryCollection, 
  deleteDocument,
  updateDocument
} from '@/lib/firebase-service';
import { Follow, FollowStats, FollowSuggestion } from '@/types/follow';
import { UserProfile } from '@/types/user';
import { createNotification } from '@/lib/notification-service';
import { getUserProfile } from '@/lib/user-service';

const FOLLOW_COLLECTION = 'follows';
const FOLLOW_STATS_COLLECTION = 'follow_stats';
const USER_COLLECTION = 'users';

// Kullanıcı takip et
export async function followUser(followerId: string, followedId: string): Promise<string> {
  // Kendini takip etmeyi engelle
  if (followerId === followedId) {
    throw new Error('Kendinizi takip edemezsiniz');
  }
  
  try {
    // Daha önce takip var mı kontrol et
    const isFollowing = await checkIfFollowing(followerId, followedId);
    
    if (isFollowing) {
      throw new Error('Bu kullanıcıyı zaten takip ediyorsunuz');
    }
    
    // Takip oluştur
    const id = `${followerId}_${followedId}`;
    const timestamp = Date.now();
    
    const follow: Follow = {
      id,
      followerId,
      followedId,
      createdAt: timestamp
    };
    
    await setDocument(FOLLOW_COLLECTION, id, follow);
    
    // Takip istatistiklerini güncelle
    await updateFollowStats(followerId, followedId, 'follow');
    
    // Takip bildirimini oluştur
    await createFollowNotification(followerId, followedId);
    
    return id;
  } catch (error) {
    console.error('Kullanıcı takip edilirken hata:', error);
    throw error;
  }
}

// Kullanıcı takibini bırak
export async function unfollowUser(followerId: string, followedId: string): Promise<void> {
  try {
    const id = `${followerId}_${followedId}`;
    const follow = await getDocument<Follow>(FOLLOW_COLLECTION, id);
    
    if (!follow) {
      throw new Error('Takip ilişkisi bulunamadı');
    }
    
    // Takibi sil
    await deleteDocument(FOLLOW_COLLECTION, id);
    
    // Takip istatistiklerini güncelle
    await updateFollowStats(followerId, followedId, 'unfollow');
  } catch (error) {
    console.error('Kullanıcı takibi bırakılırken hata:', error);
    throw error;
  }
}

// Takip edilip edilmediğini kontrol et
export async function checkIfFollowing(followerId: string, followedId: string): Promise<boolean> {
  try {
    const id = `${followerId}_${followedId}`;
    const follow = await getDocument<Follow>(FOLLOW_COLLECTION, id);
    
    return !!follow;
  } catch (error) {
    console.error('Takip durumu kontrol edilirken hata:', error);
    return false;
  }
}

// Kullanıcının takip ettiği kullanıcıları getir
export async function getFollowing(userId: string, limit = 50): Promise<UserProfile[]> {
  try {
    const result = await queryCollection<Follow>({
      collectionPath: FOLLOW_COLLECTION,
      conditions: [{ field: 'followerId', operator: '==', value: userId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount: limit
    });
    
    // Takip edilen kullanıcı ID'lerini al
    const followedIds = result.data.map(follow => follow.followedId);
    
    // Her bir takip edilen kullanıcının profilini getir
    const followingProfiles = await Promise.all(
      followedIds.map(async (followedId) => {
        const profile = await getUserProfile(followedId);
        return profile;
      })
    );
    
    // null değerleri filtrele
    return followingProfiles.filter((profile): profile is UserProfile => !!profile);
  } catch (error) {
    console.error('Takip edilen kullanıcılar getirilirken hata:', error);
    return [];
  }
}

// Kullanıcının takipçilerini getir
export async function getFollowers(userId: string, limit = 50): Promise<UserProfile[]> {
  try {
    const result = await queryCollection<Follow>({
      collectionPath: FOLLOW_COLLECTION,
      conditions: [{ field: 'followedId', operator: '==', value: userId }],
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount: limit
    });
    
    // Takipçi ID'lerini al
    const followerIds = result.data.map(follow => follow.followerId);
    
    // Her bir takipçinin profilini getir
    const followerProfiles = await Promise.all(
      followerIds.map(async (followerId) => {
        const profile = await getUserProfile(followerId);
        return profile;
      })
    );
    
    // null değerleri filtrele
    return followerProfiles.filter((profile): profile is UserProfile => !!profile);
  } catch (error) {
    console.error('Takipçiler getirilirken hata:', error);
    return [];
  }
}

// Takip istatistiklerini güncelle
async function updateFollowStats(followerId: string, followedId: string, action: 'follow' | 'unfollow'): Promise<void> {
  const increment = action === 'follow' ? 1 : -1;
  
  try {
    // Takip eden kullanıcının istatistiklerini güncelle
    const followerStatsId = followerId;
    const followerStats = await getDocument<FollowStats>(FOLLOW_STATS_COLLECTION, followerStatsId);
    
    if (followerStats) {
      await updateDocument(FOLLOW_STATS_COLLECTION, followerStatsId, {
        followingCount: Math.max(0, (followerStats.followingCount || 0) + increment)
      });
    } else {
      await setDocument(FOLLOW_STATS_COLLECTION, followerStatsId, {
        followingCount: increment > 0 ? 1 : 0,
        followersCount: 0
      });
    }
    
    // Takip edilen kullanıcının istatistiklerini güncelle
    const followedStatsId = followedId;
    const followedStats = await getDocument<FollowStats>(FOLLOW_STATS_COLLECTION, followedStatsId);
    
    if (followedStats) {
      await updateDocument(FOLLOW_STATS_COLLECTION, followedStatsId, {
        followersCount: Math.max(0, (followedStats.followersCount || 0) + increment)
      });
    } else {
      await setDocument(FOLLOW_STATS_COLLECTION, followedStatsId, {
        followersCount: increment > 0 ? 1 : 0,
        followingCount: 0
      });
    }
  } catch (error) {
    console.error('Takip istatistikleri güncellenirken hata:', error);
    throw error;
  }
}

// Takip istatistiklerini getir
export async function getFollowStats(userId: string): Promise<FollowStats> {
  try {
    const stats = await getDocument<FollowStats>(FOLLOW_STATS_COLLECTION, userId);
    
    if (stats) {
      return stats;
    }
    
    return {
      followersCount: 0,
      followingCount: 0
    };
  } catch (error) {
    console.error('Takip istatistikleri alınırken hata:', error);
    return {
      followersCount: 0,
      followingCount: 0
    };
  }
}

// Takip bildirimini oluştur
async function createFollowNotification(followerId: string, followedId: string): Promise<void> {
  try {
    const follower = await getUserProfile(followerId);
    
    if (!follower) {
      return;
    }
    
    await createNotification({
      recipientId: followedId,
      senderId: followerId,
      senderName: follower.displayName,
      senderPhoto: follower.photoURL || undefined,
      type: 'follow',
      title: 'Yeni Takipçi',
      message: `${follower.displayName} sizi takip etmeye başladı.`,
      link: `/profil/${followerId}`,
      status: 'unread'
    });
  } catch (error) {
    console.error('Takip bildirimi oluşturulurken hata:', error);
  }
}

// Takip önerileri getir
export async function getFollowSuggestions(userId: string, limit = 5): Promise<FollowSuggestion[]> {
  try {
    // Kullanıcının takip ettiklerini bul
    const following = await getFollowing(userId);
    const followingIds = following.map(user => user.id);
    followingIds.push(userId); // Kendisini de ekle
    
    // Takip edilmeyen kullanıcıları getir
    const result = await queryCollection<UserProfile>({
      collectionPath: USER_COLLECTION,
      limitCount: limit + followingIds.length // Daha fazla kullanıcı getir, filtreleme yapacağız
    });
    
    // Takip edilmeyen kullanıcıları filtrele
    const suggestions = result.data
      .filter(user => !followingIds.includes(user.id))
      .slice(0, limit)
      .map(user => ({
        userId: user.id,
        displayName: user.displayName,
        photoURL: user.photoURL,
        bio: user.bio
      }));
    
    return suggestions;
  } catch (error) {
    console.error('Takip önerileri getirilirken hata:', error);
    return [];
  }
}

// Takip/Takipçi arama
export async function searchFollowUsers(
  userId: string, 
  query: string, 
  type: 'followers' | 'following'
): Promise<UserProfile[]> {
  try {
    // Önce tüm takipçileri veya takip edilenleri al
    const users = type === 'followers' 
      ? await getFollowers(userId, 100) 
      : await getFollowing(userId, 100);
    
    // Arama terimini küçük harfe çevir
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
      return users;
    }
    
    // Arama terimine göre filtrele
    return users.filter(user => 
      user.displayName.toLowerCase().includes(searchQuery) || 
      user.email.toLowerCase().includes(searchQuery)
    );
  } catch (error) {
    console.error('Takip/Takipçi araması yapılırken hata:', error);
    return [];
  }
}