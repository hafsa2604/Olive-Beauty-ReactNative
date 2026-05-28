import { apiClient } from './apiClient';

/**
 * Saves a user's wishlist/favorites array to Firestore via the REST API.
 */
export async function syncFavoritesToFirestore(userId, favoriteIds) {
  if (!userId) return;
  try {
    const payload = {
      items: favoriteIds.map(String)
    };
    return await apiClient.post(`/api/favorites/${userId}`, payload);
  } catch (error) {
    console.error('API syncFavoritesToFirestore error:', error);
  }
}

/**
 * Retrieves a user's wishlist/favorites array from Firestore via the REST API.
 */
export async function fetchFavoritesFromFirestore(userId) {
  if (!userId) return [];
  try {
    return await apiClient.get(`/api/favorites/${userId}`);
  } catch (error) {
    console.error('API fetchFavoritesFromFirestore error:', error);
  }
  return [];
}
