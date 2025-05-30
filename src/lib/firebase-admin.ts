// src/lib/firebase-admin.ts
// Node.js runtime kullanımını belirt
export const runtime = 'nodejs';

import { initializeApp, getApps, cert } from 'firebase-admin/app';

const FIREBASE_ADMIN_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

export const adminApp = getApps().length === 0 
  ? initializeApp({
      credential: cert(FIREBASE_ADMIN_CONFIG),
    })
  : getApps()[0];