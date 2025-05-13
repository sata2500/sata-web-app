// src/middleware.ts
// Node.js runtime kullanımını belirt
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/server-auth';

// Admin sayfalarını koruyan middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin sayfaları için yetki kontrolü
  if (pathname.startsWith('/admin')) {
    try {
      // Oturum bilgisini kontrol et
      const session = await auth();
      
      // Kullanıcı giriş yapmamış veya admin değilse, yönlendir
      if (!session?.user) {
        // Oturum açılmamışsa giriş sayfasına yönlendir
        const url = new URL('/giris', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
      
      if (!session.user.isAdmin) {
        // Admin değilse ana sayfaya yönlendir
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Hata durumunda giriş sayfasına yönlendir
      console.error('Oturum doğrulama hatası:', error);
      const url = new URL('/giris', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Burada config nasıl olmalı:
export const config = {
  matcher: '/admin/:path*',
  runtime: 'nodejs', // Bu satırı ekleyin, middleware içinde de belirtebilirsiniz
};