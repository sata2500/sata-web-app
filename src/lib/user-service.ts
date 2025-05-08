// src/lib/user-service.ts

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    User as FirebaseUser
  } from 'firebase/auth';
  import { 
    getDocument, 
    setDocument, 
    updateDocument, 
    queryCollection,
    uploadFile
  } from '@/lib/firebase-service';
  import { auth } from '@/config/firebase';
  import { UserProfile } from '@/types/user';
  import { getServerTimestamp } from '@/lib/utils';
  
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