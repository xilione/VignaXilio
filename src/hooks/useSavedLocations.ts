import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import type { Location } from '@/types';
import { useAuth } from './useAuth';

export function useSavedLocations() {
  const { user } = useAuth();
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setSavedLocations([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSavedLocations(data.savedLocations || []);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveLocation = async (location: Location) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        savedLocations: arrayUnion(location)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateLocation = async (oldLocation: Location, newLocation: Location) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      // Firestore array updates are tricky for objects. We remove the old and add the new.
      await updateDoc(userRef, {
        savedLocations: arrayRemove(oldLocation)
      });
      await updateDoc(userRef, {
        savedLocations: arrayUnion(newLocation)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const removeLocation = async (location: Location) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        savedLocations: arrayRemove(location)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isSaved = (location: Location) => {
    return savedLocations.some(
      (loc) => loc.latitude === location.latitude && loc.longitude === location.longitude
    );
  };

  return { savedLocations, loading, saveLocation, updateLocation, removeLocation, isSaved };
}
