import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface AIAdvice {
  id?: string;
  title: string;
  content: string;
  date: string;
  type: 'meteo' | 'prodotti' | 'analisi' | 'generale';
}

export function useAIAdvice() {
  const { user } = useAuth();
  const [advices, setAdvices] = useState<AIAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setAdvices([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const q = query(
      collection(db, `users/${user.uid}/ai_advice`),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adviceData: AIAdvice[] = [];
      snapshot.forEach((doc) => {
        adviceData.push({ id: doc.id, ...doc.data() } as AIAdvice);
      });
      setAdvices(adviceData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/ai_advice`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addAdvice = async (advice: Omit<AIAdvice, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/ai_advice`), advice);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/ai_advice`);
    }
  };

  const removeAdvice = async (adviceId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/ai_advice/${adviceId}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/ai_advice/${adviceId}`);
    }
  };

  return { advices, loading, addAdvice, removeAdvice };
}
