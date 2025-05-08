import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import { UserAuth } from '@/types/user';
import { getUserProfile } from '@/lib/user-service';

const adminAuth = getAuth(adminApp);

export async function auth(): Promise<{ user: UserAuth | null }> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebaseSessionToken')?.value;
  
    console.log('Session Cookie:', sessionCookie ? 'Mevcut' : 'Yok');
  
    if (!sessionCookie) {
      return { user: null };
    }
  
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
      console.log('Decoded Token:', decodedToken);
      
      const userProfile = await getUserProfile(decodedToken.uid);
      console.log('User Profile:', userProfile);
      
      if (!userProfile) {
        return { user: null };
      }
      
      const user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL || null,
        isAdmin: userProfile.role === 'admin',
        isEditor: userProfile.role === 'editor' || userProfile.role === 'admin'
      };
      
      console.log('Auth Result:', user);
      return { user };
    } catch (error) {
      console.error('Oturum doğrulama hatası:', error);
      return { user: null };
    }
  }