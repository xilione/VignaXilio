import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import type { Treatment } from '@/types';
import { useAuth } from './useAuth';

export function useTreatments(locationName?: string) {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTreatments([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, `users/${user.uid}/treatments`),
      orderBy('date', 'desc')
    );

    if (locationName) {
      q = query(
        collection(db, `users/${user.uid}/treatments`),
        where('locationName', '==', locationName),
        orderBy('date', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const treatmentsData: Treatment[] = [];
      snapshot.forEach((doc) => {
        treatmentsData.push({ id: doc.id, ...doc.data() } as Treatment);
      });
      setTreatments(treatmentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/treatments`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, locationName]);

  const addTreatment = async (treatment: Omit<Treatment, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/treatments`), treatment);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/treatments`);
    }
  };

  const removeTreatment = async (treatmentId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/treatments/${treatmentId}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/treatments/${treatmentId}`);
    }
  };

  return { treatments, loading, addTreatment, removeTreatment };
}
