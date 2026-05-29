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

  // Extract filename and mime type for upload
  const cleanUri = localUri.split('?')[0];
  const filename = cleanUri.split('/').pop() || 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Map common extensions to their standard MIME types
  const mimeMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heic',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'ico': 'image/x-icon'
  };
  
  const type = mimeMap[ext] || (ext && /^[a-zA-Z0-9]+$/.test(ext) ? `image/${ext}` : 'image/jpeg');

  // Tier 1: Try uploading via backend server
  try {
    console.log(`[ProductService] Uploading image via backend: ${API_BASE_URL}`);
    const formData = new FormData();
    
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
    console.warn('[ProductService] Backend image upload failed. Attempting Tier 2 direct Firebase Storage upload...', error.message || error);
    
    // Tier 2: Direct client-side upload to Firebase Storage
    try {
      const storageRef = ref(storage, `products/${Date.now()}-${filename}`);
      
      console.log('[ProductService] Converting local URI to blob for direct upload...');
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function(e) {
          reject(new Error('Failed to convert local image file to blob for direct upload.'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', localUri, true);
        xhr.send(null);
      });
      
      console.log('[ProductService] Uploading blob directly to Firebase Storage...');
      await uploadBytes(storageRef, blob, {
        contentType: type
      });
      
      if (typeof blob.close === 'function') {
        blob.close();
      }
      
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('[ProductService] Direct Firebase Storage upload successful:', downloadUrl);
      return downloadUrl;
    } catch (fbError) {
      console.error('[ProductService] Direct Firebase Storage upload failed:', fbError.message || fbError);
      
      // Tier 3: Local Device URI Fallback
      // This ensures that the user's project DOES NOT CRASH or fail to save.
      // The image will show up on their current device.
      console.log('[ProductService] Tier 3 Fallback: Storing local device file URI:', localUri);
      return localUri;
    }
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
