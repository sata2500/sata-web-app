// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin sayfalarını koruyan middleware
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('firebaseSessionToken')?.value;
  const { pathname } = request.nextUrl;

  // Admin sayfaları için oturum kontrolü
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      const url = new URL('/giris', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Middleware'i hangi yollarda çalıştıracağımızı belirleyen konfigürasyon
export const config = {
  matcher: '/admin/:path*',
};