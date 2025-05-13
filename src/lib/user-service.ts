// src/lib/user-service.ts

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User as FirebaseUser,
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword as firebaseUpdatePassword,
  deleteUser
} from 'firebase/auth';
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  queryCollection,
  uploadFile,
  deleteDocument
} from '@/lib/firebase-service';
import { auth } from '@/config/firebase';
import { UserProfile } from '@/types/user';
import { getServerTimestamp } from '@/lib/utils';

// Firebase hataları için özel tip tanımlaması
interface FirebaseError extends Error {
  code?: string;
  message: string;
}

const USER_COLLECTION = 'users';

// Firebase kullanıcısından UserProfile oluşturma
export const createUserProfileFromFirebaseUser = async (user: FirebaseUser): Promise<UserProfile> => {
  const timestamp = getServerTimestamp();
  
  const userProfile: UserProfile = {
    id: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
    email: user.email || '',
    photoURL: user.photoURL || null, // null değeri kullan
    role: 'user',
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await setDocument(USER_COLLECTION, user.uid, userProfile);
  return userProfile;
};

// Kullanıcı profili alma
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profile = await getDocument<UserProfile>(USER_COLLECTION, userId);
    if (!profile) {
      console.log(`User profile not found for userId: ${userId}`);
    }
    return profile;
  } catch (error) {
    console.error(`Error getting user profile for userId: ${userId}:`, error);
    return null;
  }
};

// Kullanıcı profili güncelleme
export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  const timestamp = getServerTimestamp();
  
  await updateDocument(USER_COLLECTION, userId, {
    ...profile,
    updatedAt: timestamp
  });
};

// E-posta ve şifre ile kayıt
export const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<UserProfile> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Firebase Auth'daki displayName'i güncelle
  await updateProfile(user, { displayName });
  
  // Kullanıcı profili oluştur
  const userProfile = await createUserProfileFromFirebaseUser(user);
  
  // Session cookie oluşturmak için
  try {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  } catch (error) {
    console.error('Session oluşturma hatası:', error);
  }
  
  return userProfile;
};

// E-posta ve şifre ile giriş
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Session cookie oluşturmak için
  try {
    const idToken = await userCredential.user.getIdToken();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  } catch (error) {
    console.error('Session oluşturma hatası:', error);
  }
  
  return userCredential.user;
};

// Google ile giriş
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  
  // Kullanıcı zaten varsa profili güncelle, yoksa yeni profil oluştur
  const userProfile = await getUserProfile(userCredential.user.uid);
  
  if (!userProfile) {
    await createUserProfileFromFirebaseUser(userCredential.user);
  }
  
  // Session cookie oluşturmak için
  try {
    const idToken = await userCredential.user.getIdToken();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
  } catch (error) {
    console.error('Session oluşturma hatası:', error);
  }
  
  return userCredential.user;
};

// Çıkış yapma
export const logout = async (): Promise<void> => {
  // Önce Firebase'den çıkış yap
  await signOut(auth);
  
  // Sonra session cookie'yi temizle
  try {
    await fetch('/api/auth/logout', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Session silme hatası:', error);
  }
};

// Profil resmi yükleme
export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  const path = `user_images/${userId}/profile`;
  const photoURL = await uploadFile(path, file);
  
  // Firebase Auth ve kullanıcı profilini güncelle
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL });
  }
  
  await updateUserProfile(userId, { photoURL });
  
  return photoURL;
};

// Tüm kullanıcıları listeleme (sadece admin erişimli)
export const getUsers = async (): Promise<UserProfile[]> => {
  const result = await queryCollection<UserProfile>({
    collectionPath: USER_COLLECTION,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    limitCount: 100
  });
  
  return result.data;
};

// Kullanıcı rolü güncelleme (sadece admin erişimli)
export const updateUserRole = async (
  userId: string, 
  role: 'user' | 'editor' | 'admin'
): Promise<void> => {
  await updateUserProfile(userId, { role });
};

// Şifre güncelleme
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  // Kullanıcı giriş yapmış olmalı
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error('Şifre güncellemek için giriş yapmalısınız.');
  }
  
  try {
    // Önce kullanıcıyı mevcut şifresiyle yeniden doğrulayalım
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(currentUser, credential);
    
    // Şimdi şifreyi güncelleyebiliriz
    await firebaseUpdatePassword(currentUser, newPassword);
  } catch (error: unknown) {
    console.error('Şifre güncellenirken hata oluştu:', error);
    
    // Firebase Authentication hatalarını daha anlaşılır mesajlara çevirelim
    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Mevcut şifreniz yanlış.');
      } else if (firebaseError.code === 'auth/weak-password') {
        throw new Error('Yeni şifre çok zayıf. En az 6 karakter uzunluğunda olmalıdır.');
      } else {
        throw new Error(error.message || 'Şifre güncellenirken bir hata oluştu.');
      }
    } else {
      throw new Error('Şifre güncellenirken bir hata oluştu.');
    }
  }
};

// Bildirim ayarlarını alma
export const getUserNotificationSettings = async (userId: string): Promise<{
  emailNotifications: boolean;
  blogUpdates: boolean;
  newComments: boolean;
  commentReplies: boolean;
  newFeatures: boolean;
  marketing: boolean;
} | null> => {
  try {
    // Firestore'dan kullanıcı ayarlarını alalım
    const userSettings = await getDocument<{
      notificationSettings?: {
        emailNotifications: boolean;
        blogUpdates: boolean;
        newComments: boolean;
        commentReplies: boolean;
        newFeatures: boolean;
        marketing: boolean;
      }
    }>(USER_COLLECTION, userId);
    
    // Eğer ayarlar varsa döndür, yoksa varsayılan ayarları döndür
    if (userSettings && userSettings.notificationSettings) {
      return userSettings.notificationSettings;
    }
    
    // Varsayılan ayarlar
    return {
      emailNotifications: true,
      blogUpdates: true,
      newComments: true,
      commentReplies: true,
      newFeatures: true,
      marketing: false
    };
  } catch (error) {
    console.error('Bildirim ayarları alınırken bir hata oluştu:', error);
    throw error;
  }
};

// Bildirim ayarlarını güncelleme
export const updateUserNotificationSettings = async (
  userId: string, 
  settings: {
    emailNotifications: boolean;
    blogUpdates: boolean;
    newComments: boolean;
    commentReplies: boolean;
    newFeatures: boolean;
    marketing: boolean;
  }
): Promise<void> => {
  try {
    // Firestore'da kullanıcı ayarlarını güncelleyelim
    await updateDocument(USER_COLLECTION, userId, {
      notificationSettings: settings,
      updatedAt: getServerTimestamp()
    });
  } catch (error) {
    console.error('Bildirim ayarları güncellenirken bir hata oluştu:', error);
    throw error;
  }
};

// Kullanıcı hesabını silme
export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Hesap silmek için giriş yapmalısınız.');
    }
    
    // Kullanıcıya ait tüm verileri silelim
    // 1. Kullanıcının yorumlarını sil
    // 2. Kullanıcının blog yazılarını veya diğer içeriklerini sil
    // 3. Kullanıcının profilini sil
    
    // Örnek: Yorumları silme (blog-service'ten uygun bir method eklenmelidir)
    // await deleteUserComments(userId);
    
    // Örnek: Blog yazılarını silme (blog-service'ten uygun bir method eklenmelidir)
    // await deleteUserPosts(userId);
    
    // Kullanıcı profilini Firestore'dan sil
    await deleteDocument(USER_COLLECTION, userId);
    
    // Firebase Authentication'dan kullanıcıyı sil
    await deleteUser(currentUser);
  } catch (error: unknown) {
    console.error('Hesap silinirken bir hata oluştu:', error);
    
    // Firebase Authentication hatalarını daha anlaşılır mesajlara çevirelim
    if (error instanceof Error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/requires-recent-login') {
        throw new Error('Güvenlik nedeniyle, hesabınızı silmeden önce yeniden giriş yapmanız gerekiyor.');
      } else {
        throw new Error(error.message || 'Hesap silinirken bir hata oluştu.');
      }
    } else {
      throw new Error('Hesap silinirken bir hata oluştu.');
    }
  }
};

// User namespace olarak kod içinde yeniden dışa aktarılması
export const User = {
  getUserProfile,
  updateUserProfile,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  logout,
  uploadProfilePhoto,
  getUsers,
  updateUserRole,
  updatePassword,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  deleteUserAccount
};