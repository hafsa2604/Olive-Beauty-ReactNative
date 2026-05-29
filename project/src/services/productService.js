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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { API_BASE_URL } from './apiConfig';
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
 * Uploads a local image (file/picker URI) to Firebase Storage via backend and returns the secure download URL.
 * Supports Expo Go on both iOS and Android.
 */
export async function uploadProductImage(localUri) {
  if (!localUri) return null;

  try {
    console.log(`[ProductService] Uploading image via backend: ${API_BASE_URL}`);
    const formData = new FormData();
    
    // Extract filename and mime type for multipart upload
    const filename = localUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    // React Native's Native networking layer will intercept this object and upload the file directly.
    // It completely bypasses JS Blob and ArrayBuffer layers, ensuring a crash-free, permanent fix.
    formData.append('image', {
      uri: localUri,
      name: filename,
      type: type,
    });

    const response = await fetch(`${API_BASE_URL}/api/uploads/product-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload server responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.imageUrl) {
      throw new Error('Upload response did not return an imageUrl');
    }
    
    console.log('[ProductService] Upload successful:', data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading product image through backend:', error);
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
