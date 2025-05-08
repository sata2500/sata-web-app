// src/hooks/use-firestore-collection.ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  WhereFilterOp, // Firebase'den WhereFilterOp tipini ekliyoruz
  OrderByDirection // Firebase'den OrderByDirection tipini ekliyoruz
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Her türlü değeri kabul eden tip (any yerine)
type FirestoreValue = string | number | boolean | Date | null | undefined | DocumentData;

type UseFirestoreCollectionOptions = {
  conditions?: { field: string; operator: WhereFilterOp; value: FirestoreValue }[]; // any yerine spesifik tip
  orderByField?: string;
  orderDirection?: OrderByDirection; // 'asc' | 'desc' yerine OrderByDirection kullanıyoruz
  limitCount?: number;
};

export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  options: UseFirestoreCollectionOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionPath) return;

    setLoading(true);
    setError(null);

    const constraints: QueryConstraint[] = [];

    // Koşulları ekle
    if (options.conditions) {
      options.conditions.forEach(condition => {
        constraints.push(where(condition.field, condition.operator, condition.value));
      });
    }

    // Sıralama ekle
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
    }

    // Limit ekle
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collection(db, collectionPath), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(fetchedData);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore koleksiyon izleme hatası:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionPath, options]);

  return { data, loading, error };
}