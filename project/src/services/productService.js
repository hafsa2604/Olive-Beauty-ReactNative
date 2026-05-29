import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { INITIAL_PRODUCTS } from '@/data/products';
import { normalizeProduct } from '@/lib/product';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetches all products from Firestore.
 * Optionally supports a callback for real-time updates.
 */
export function listenToProducts(onUpdate, onError) {
  const q = query(collection(db, PRODUCTS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const products = [];
      snapshot.forEach((docSnap) => {
        products.push(normalizeProduct({ id: docSnap.id, ...docSnap.data() }));
      });
      onUpdate(products);
    },
    (error) => {
      console.warn('Error listening to products:', error.message);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetches products statically using getDocs.
 */
export async function fetchProducts() {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const products = [];
  querySnapshot.forEach((docSnap) => {
    products.push(normalizeProduct({ id: docSnap.id, ...docSnap.data() }));
  });
  return products;
}

/**
 * Creates/Adds a new product in Firestore.
 */
export async function addProduct(productData) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  const payload = {
    name: productData.name || '',
    description: productData.description || '',
    price: parseFloat(productData.price) || 0,
    category: productData.category || 'skincare',
    skinType: productData.skinType || 'Suitable for all skin types',
    hairType: productData.hairType || (productData.category === 'haircare' ? 'Suitable for all hair types' : 'N/A'),
    ingredients: productData.ingredients || 'Natural botanical extracts',
    usageInstructions: productData.usageInstructions || 'Apply gently onto clean skin or hair.',
    rating: parseFloat(productData.rating) || 4.5,
    stock: parseInt(productData.stock, 10) || 50,
    inStock: (parseInt(productData.stock, 10) || 50) > 0,
    image: productData.image || '',
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
}

/**
 * Updates an existing product in Firestore.
 */
export async function updateProduct(id, updates) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const payload = { ...updates };
  if (payload.price !== undefined) payload.price = parseFloat(payload.price);
  if (payload.rating !== undefined) payload.rating = parseFloat(payload.rating);
  if (payload.stock !== undefined) {
    payload.stock = parseInt(payload.stock, 10);
    payload.inStock = payload.stock > 0;
  }

  await updateDoc(docRef, payload);
}

/**
 * Deletes a product from Firestore.
 */
export async function deleteProduct(id) {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Uploads a local image (file/picker URI) to Firebase Storage and returns the secure download URL.
 * Supports Expo Go on both iOS and Android.
 */
export async function uploadProductImage(localUri, base64String) {
  if (!localUri) return null;

  try {
    // Create a unique filename under products/ folder
    const fileExtension = localUri.split('.').pop() || 'jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const storageRef = ref(storage, filename);

    if (base64String) {
      // Reliable upload for Expo Go on physical iOS devices
      const dataUrl = `data:image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension};base64,${base64String}`;
      await uploadString(storageRef, dataUrl, 'data_url');
    } else {
      // Standard react-native fetch-blob strategy fallback
      const response = await fetch(localUri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
    }

    // Fetch secure public download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading product image to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Checks if the products collection is empty and seeds it with INITIAL_PRODUCTS if so.
 */
export async function seedProductsIfEmpty() {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (querySnapshot.empty) {
      console.log('Firestore products collection is empty. Seeding initial products...');
      
      // Seed all 41 default items
      for (const item of INITIAL_PRODUCTS) {
        const payload = {
          name: item.name,
          description: item.description,
          price: Number(item.price) || 0,
          category: item.category || 'skincare',
          skinType: item.skinType || 'Suitable for all skin types',
          hairType: item.hairType || (item.category === 'haircare' ? 'Suitable for all hair types' : 'N/A'),
          ingredients: item.ingredients || 'Natural botanical extracts',
          usageInstructions: item.usageInstructions || 'Apply gently onto clean skin or hair.',
          rating: Number(item.rating) || 4.5,
          stock: Number(item.stock) || 50,
          inStock: true,
          image: item.image || '',
          createdAt: new Date().toISOString(),
        };
        
        // Write item using its original ID to keep references consistent
        const docRef = doc(db, PRODUCTS_COLLECTION, String(item.id));
        await setDoc(docRef, payload);
      }
      console.log('Successfully seeded 41 products into Firestore!');
    }
  } catch (error) {
    console.error('Failed to seed products into Firestore:', error);
  }
}
