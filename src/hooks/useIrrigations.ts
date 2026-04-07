import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import type { Irrigation } from '@/types';
import { useAuth } from './useAuth';

export function useIrrigations(locationName?: string) {
  const { user } = useAuth();
  const [irrigations, setIrrigations] = useState<Irrigation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setIrrigations([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let q = query(
      collection(db, `users/${user.uid}/irrigations`),
      orderBy('date', 'desc')
    );

    if (locationName) {
      q = query(
        collection(db, `users/${user.uid}/irrigations`),
        where('locationName', '==', locationName),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const irrigationsData: Irrigation[] = [];
      snapshot.forEach((doc) => {
        irrigationsData.push({ id: doc.id, ...doc.data() } as Irrigation);
      });
      setIrrigations(irrigationsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/irrigations`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, locationName]);

  const addIrrigation = async (irrigation: Omit<Irrigation, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/irrigations`), irrigation);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/irrigations`);
    }
  };

  const removeIrrigation = async (irrigationId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/irrigations/${irrigationId}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/irrigations/${irrigationId}`);
    }
  };

  return { irrigations, loading, addIrrigation, removeIrrigation };
}
