import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const CART_COLLECTION = 'cart';

/**
 * Saves a user's shopping cart items array to Firestore.
 */
export async function syncCartToFirestore(userId, cartItems) {
  if (!userId) return;
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await setDoc(cartRef, {
      userId,
      items: cartItems.map((item) => ({
        productId: String(item.productId),
        quantity: parseInt(item.quantity) || 1,
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing cart to Firestore:', error);
  }
}

/**
 * Retrieves a user's shopping cart items array from Firestore.
 */
export async function fetchCartFromFirestore(userId) {
  if (!userId) return [];
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      return snap.data().items || [];
    }
  } catch (error) {
    console.error('Error fetching cart from Firestore:', error);
  }
  return [];
}
