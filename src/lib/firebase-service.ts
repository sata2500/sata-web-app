// src/lib/firebase-service.ts

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { db, storage } from '@/config/firebase';
  import { WhereFilterOp } from 'firebase/firestore';
  
  // Koleksiyon referansı alma
  export const getCollectionRef = <T = DocumentData>(collectionPath: string): CollectionReference<T> => {
    return collection(db, collectionPath) as CollectionReference<T>;
  };
  
  // Belge referansı alma
  export const getDocRef = <T = DocumentData>(collectionPath: string, docId: string): DocumentReference<T> => {
    return doc(db, collectionPath, docId) as DocumentReference<T>;
  };
  
  // Belge oluşturma veya güncelleme
  export const setDocument = async <T extends DocumentData>(
    collectionPath: string, 
    docId: string, 
    data: T
  ): Promise<void> => {
    const docRef = getDocRef(collectionPath, docId);
    await setDoc(docRef, data, { merge: true });
  };
  
  // Belge alma
  export const getDocument = async <T = DocumentData>(
    collectionPath: string, 
    docId: string
  ): Promise<T | null> => {
    try {
      const docRef = getDocRef<T>(collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionPath}/${docId}:`, error);
      return null;
    }
  };
  
  // Koleksiyon alma (basit sorgu)
  export const getCollection = async <T = DocumentData>(
    collectionPath: string
  ): Promise<T[]> => {
    const colRef = getCollectionRef<T>(collectionPath);
    const querySnapshot = await getDocs(colRef);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  };
  
  // Gelişmiş sorgu ile koleksiyon alma (sayfalama dahil)
  export const queryCollection = async <T = DocumentData>({
    collectionPath,
    conditions = [],
    orderByField,
    orderDirection = 'desc',
    limitCount = 10,
    startAfterDoc = null
  }: {
    collectionPath: string;
    conditions?: { field: string; operator: string; value: unknown }[];
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
    startAfterDoc?: QueryDocumentSnapshot<T> | null;
  }): Promise<{ data: T[]; lastDoc: QueryDocumentSnapshot<T> | null }> => {
    const colRef = getCollectionRef<T>(collectionPath);
    
    let q = query(colRef);
    
    // Koşulları ekle
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator as WhereFilterOp, condition.value));
    });
    
    // Sıralama ekle
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    // Sayfalama ekle
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }
    
    // Limit ekle
    q = query(q, limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const lastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
    
    return {
      data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)),
      lastDoc
    };
  };
  
  // Belge güncelleme
  export const updateDocument = async <T extends DocumentData>(
    collectionPath: string, 
    docId: string, 
    data: Partial<T>
  ): Promise<void> => {
    const docRef = getDocRef(collectionPath, docId);
    await updateDoc(docRef, data as DocumentData);
  };
  
  // Belge silme
  export const deleteDocument = async (
    collectionPath: string, 
    docId: string
  ): Promise<void> => {
    const docRef = getDocRef(collectionPath, docId);
    await deleteDoc(docRef);
  };
  
  // Dosya yükleme
  export const uploadFile = async (
    path: string, 
    file: File
  ): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };
  
  // Dosya silme
  export const deleteFile = async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  };