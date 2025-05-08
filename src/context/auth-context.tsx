// src/context/auth-context.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { UserAuth, UserProfile } from '@/types/user';
import { 
  getUserProfile, 
  loginWithEmailAndPassword, 
  loginWithGoogle, 
  logout,
  registerWithEmailAndPassword
} from '@/lib/user-service';

interface AuthContextType {
  user: UserAuth | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  signInWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  signUpWithEmail: async () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          // Firestore'dan kullanıcı profilini al
          const profile = await getUserProfile(firebaseUser.uid);
          
          setUserProfile(profile);
          
          // Auth context için kullanıcı bilgilerini oluştur
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || profile?.displayName || 'Kullanıcı',
            photoURL: firebaseUser.photoURL || null,
            isAdmin: profile?.role === 'admin',
            isEditor: profile?.role === 'editor' || profile?.role === 'admin'
          });
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Kullanıcı profili alınırken hata oluştu:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // E-posta ve şifre ile giriş
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await loginWithEmailAndPassword(email, password);
    } catch (err: any) {
      console.error('Giriş yaparken hata oluştu:', err);
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google ile giriş
  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google ile giriş yaparken hata oluştu:', err);
      setError(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const signOut = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await logout();
    } catch (err: any) {
      console.error('Çıkış yaparken hata oluştu:', err);
      setError(err.message || 'Çıkış yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // E-posta ve şifre ile kayıt
  const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await registerWithEmailAndPassword(email, password, displayName);
    } catch (err: any) {
      console.error('Kayıt olurken hata oluştu:', err);
      setError(err.message || 'Kayıt olurken bir hata oluştu.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userProfile, 
        loading, 
        error, 
        signInWithEmail, 
        signInWithGoogle, 
        signOut,
        signUpWithEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Auth Hook
export const useAuth = () => {
  return React.useContext(AuthContext);
};