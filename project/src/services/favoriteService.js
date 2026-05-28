import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const FAVORITES_COLLECTION = 'favorites';

/**
 * Saves a user's wishlist/favorites array to Firestore.
 */
export async function syncFavoritesToFirestore(userId, favoriteIds) {
  if (!userId) return;
  try {
    const favRef = doc(db, FAVORITES_COLLECTION, userId);
    await setDoc(favRef, {
      userId,
      items: favoriteIds.map(String),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing favorites to Firestore:', error);
  }
}

/**
 * Retrieves a user's wishlist/favorites array from Firestore.
 */
export async function fetchFavoritesFromFirestore(userId) {
  if (!userId) return [];
  try {
    const favRef = doc(db, FAVORITES_COLLECTION, userId);
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      return snap.data().items || [];
    }
  } catch (error) {
    console.error('Error fetching favorites from Firestore:', error);
  }
  return [];
}
