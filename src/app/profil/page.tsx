'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  useEffect(() => {
    // Kullanıcı girişi yapılmamışsa giriş sayfasına yönlendir
    if (!user && !loading) {
      router.push('/giris');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setLoading(false);
    }
  }, [user, loading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setUpdateError('');
    
    try {
      // Firebase ile profil güncelleme işlemi yapılabilir
      // Şimdilik sadece simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Profil güncellendi:', displayName);
      
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Profil güncellenirken hata oluştu:', err);
      setUpdateError('Profil güncellenirken bir hata oluştu.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Çıkış yapılırken hata oluştu:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // useEffect içinde zaten yönlendirme yapılıyor
  }
  
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="card p-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Kullanıcı'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'K'}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-1">
                  {user.displayName || 'İsimsiz Kullanıcı'}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {user.email}
                </p>
                
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Profil Bilgileri</h2>
              
              {updateSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">Profil bilgileriniz başarıyla güncellendi.</span>
                </div>
              )}
              
              {updateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">{updateError}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                    İsim Soyisim
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    E-posta
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez.</p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
            
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Hesap</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Şifre Değiştir</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirmenizi öneririz.
                  </p>
                  <button className="btn btn-outline">
                    Şifre Değiştir
                  </button>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2 text-red-600">Tehlikeli Bölge</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                  </p>
                  <button className="btn bg-red-600 text-white hover:bg-red-700">
                    Hesabı Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}