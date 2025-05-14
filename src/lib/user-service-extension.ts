// src/lib/user-service-extension.ts
import { 
  registerWithEmailAndPassword as originalRegister, 
  loginWithGoogle as originalGoogleLogin 
} from '@/lib/user-service';
import { createWelcomeNotification } from '@/lib/notification-service';

// Kayıt işlemi ve hoş geldin bildirimi gönderimi
export const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  displayName: string
) => {
  // Orijinal kayıt fonksiyonunu çağır
  const user = await originalRegister(email, password, displayName);
  
  // Hoş geldin bildirimi gönder
  try {
    await createWelcomeNotification(user.id, displayName);
  } catch (error) {
    console.error('Hoş geldin bildirimi oluşturulurken hata:', error);
    // Ana işlem başarılı olduğu için hata fırlatma
  }
  
  return user;
};

// Google ile giriş ve ilk kez giriş yapan kullanıcılara hoş geldin bildirimi
export const loginWithGoogle = async () => {
  // Orijinal Google giriş fonksiyonunu çağır
  const user = await originalGoogleLogin();
  
  // Kullanıcı ilk kez giriş yaptıysa bildirim gönder
  // Bu bilgiyi kontrol etmek için bir yaklaşım geliştirilebilir
  // Örneğin, kullanıcının createdAt ve lastLoginAt değerlerini kontrol ederek
  
  return user;
};