import { apiClient } from './apiClient';

/**
 * Saves a user's shopping cart items array to Firestore via the REST API.
 */
export async function syncCartToFirestore(userId, cartItems) {
  if (!userId) return;
  try {
    const payload = {
      items: cartItems.map((item) => ({
        productId: String(item.productId),
        quantity: parseInt(item.quantity) || 1,
      }))
    };
    return await apiClient.post(`/api/cart/${userId}`, payload);
  } catch (error) {
    console.error('API syncCartToFirestore error:', error);
  }
}

/**
 * Retrieves a user's shopping cart items array from Firestore via the REST API.
 */
export async function fetchCartFromFirestore(userId) {
  if (!userId) return [];
  try {
    return await apiClient.get(`/api/cart/${userId}`);
  } catch (error) {
    console.error('API fetchCartFromFirestore error:', error);
  }
  return [];
}
