// src/components/profile/profile-header.tsx
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface ProfileHeaderProps {
  photoURL: string | null;
  displayName: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  joinDate: number;
}

export function ProfileHeader({
  photoURL,
  displayName,
  email,
  role,
  joinDate,
}: ProfileHeaderProps) {
  // Rol için badge rengini belirle
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Rol için Türkçe isim
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Yönetici';
      case 'editor':
        return 'Editör';
      default:
        return 'Kullanıcı';
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border border-border">
      <div className="flex-shrink-0">
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-30 h-30 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="flex-grow text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <Badge variant={getRoleBadgeVariant(role)} className="ml-0 md:ml-2">
            {getRoleDisplayName(role)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mt-1">{email}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-sm">
              {formatRelativeTime(joinDate)} katıldı
            </span>
          </div>
          
          {/* İsterseniz buraya daha fazla kullanıcı istatistiği ekleyebilirsiniz */}
        </div>
      </div>
      
      <div className="flex-shrink-0 mt-4 md:mt-0">
        <a 
          href="/profil/ayarlar" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Profili Düzenle
        </a>
      </div>
    </div>
  );
}