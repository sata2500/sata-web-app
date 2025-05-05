'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/config/firebase';

// Auth context için tip tanımları
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
};

// Context'i oluştur
const AuthContext = createContext<AuthContextType | null>(null);

// Context provider bileşeni
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google ile giriş yapma fonksiyonu
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Email ve şifre ile giriş yapma fonksiyonu
  const signInWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Email ve şifre ile kayıt olma fonksiyonu
  const signUpWithEmail = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Çıkış yapma fonksiyonu
  const logout = () => {
    return signOut(auth);
  };

  // Auth durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Temizleme fonksiyonu
    return () => unsubscribe();
  }, []);

  // Context değerleri
  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Auth hook'u
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
}