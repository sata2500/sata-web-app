import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // Firebase session çerezini temizle (await ile cookies fonksiyonunu çağırın)
  const cookieStore = await cookies();
  cookieStore.delete('firebaseSessionToken');
  
  return NextResponse.json({ status: 'success' }, { status: 200 });
}