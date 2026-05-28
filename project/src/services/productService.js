import { apiClient } from './apiClient';
import { API_BASE_URL } from './apiConfig';

/**
 * Fetches products statically using the REST API.
 */
export async function fetchProducts() {
  try {
    return await apiClient.get('/api/products');
  } catch (error) {
    console.error('API fetchProducts error:', error);
    throw error;
  }
}

/**
 * Kept for compatbility. Emulates real-time subscription using a REST fetch.
 */
export function listenToProducts(onUpdate, onError) {
  fetchProducts()
    .then(onUpdate)
    .catch((error) => {
      console.warn('Error fetching products inside listenToProducts:', error.message);
      if (onError) onError(error);
    });
  
  // Return a dummy unsubscribe stub
  return () => {};
}

/**
 * Creates/Adds a new product using the REST API (Admin).
 */
export async function addProduct(productData) {
  try {
    return await apiClient.post('/api/products', productData);
  } catch (error) {
    console.error('API addProduct error:', error);
    throw error;
  }
}

/**
 * Updates an existing product using the REST API (Admin).
 */
export async function updateProduct(id, updates) {
  try {
    return await apiClient.put(`/api/products/${id}`, updates);
  } catch (error) {
    console.error('API updateProduct error:', error);
    throw error;
  }
}

/**
 * Deletes a product using the REST API (Admin).
 */
export async function deleteProduct(id) {
  try {
    return await apiClient.delete(`/api/products/${id}`);
  } catch (error) {
    console.error('API deleteProduct error:', error);
    throw error;
  }
}

/**
 * Uploads a local image via backend REST API and returns image URL.
 */
export async function uploadProductImage(localUri) {
  if (!localUri) return null;

  try {
    const formData = new FormData();
    const fileName = localUri.split('/').pop() || `product-${Date.now()}.jpg`;

    formData.append('image', {
      uri: localUri,
      name: fileName,
      type: 'image/jpeg',
    });

    const response = await fetch(`${API_BASE_URL}/api/uploads/product-image`, {
      method: 'POST',
      body: formData,
    });

    const raw = await response.text();
    let result = null;
    try {
      result = raw ? JSON.parse(raw) : {};
    } catch {
      result = null;
    }

    if (!response.ok) {
      const serverMessage =
        result?.error ||
        (raw && raw.trim().startsWith('<')
          ? 'Upload endpoint is unavailable. Please restart backend server and ensure /api/uploads/product-image is active.'
          : raw) ||
        `Image upload failed (HTTP ${response.status}).`;
      throw new Error(serverMessage);
    }

    if (!result?.imageUrl) {
      throw new Error('Upload completed but image URL was not returned by server.');
    }

    return result.imageUrl;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
}

/**
 * Stub kept for compatibility (seeding is now performed on the Express server startup).
 */
export async function seedProductsIfEmpty() {
  // Handled automatically by the Express API server on startup.
  return Promise.resolve();
}
