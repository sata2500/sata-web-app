import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

const auth = getAuth(adminApp);

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // ID token'ı maksimum 5 günlük bir oturum çerezi olarak ayarla
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 gün
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    // Çerezi ayarla (await ile cookies fonksiyonunu çağırın)
    const cookieStore = await cookies();
    cookieStore.set('firebaseSessionToken', sessionCookie, {
      maxAge: expiresIn / 1000, // saniye cinsinden
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Session oluşturma hatası:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}