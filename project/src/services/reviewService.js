import { apiClient } from './apiClient';

/**
 * Fetches all reviews from the REST API.
 */
export async function fetchReviews() {
  try {
    return await apiClient.get('/api/reviews');
  } catch (error) {
    console.error('API fetchReviews error:', error);
    throw error;
  }
}

/**
 * Emulates real-time subscription using a REST fetch for reviews.
 */
export function listenToReviews(onUpdate, onError) {
  fetchReviews()
    .then(onUpdate)
    .catch((error) => {
      console.warn('Error fetching reviews inside listenToReviews:', error.message);
      if (onError) onError(error);
    });

  // Return a dummy unsubscribe stub
  return () => {};
}

/**
 * Adds a new review via the REST API.
 */
export async function addReview({ productId, userId, authorName, rating, comment }) {
  const payload = {
    productId: String(productId),
    userId: userId || null,
    authorName: authorName.trim(),
    rating: Number(rating),
    comment: comment.trim()
  };

  try {
    return await apiClient.post('/api/reviews', payload);
  } catch (error) {
    console.error('API addReview error:', error);
    throw error;
  }
}

/**
 * Deletes a review via the REST API.
 */
export async function deleteReview(reviewId, productId) {
  try {
    return await apiClient.delete(`/api/reviews/${reviewId}?productId=${productId}`);
  } catch (error) {
    console.error('API deleteReview error:', error);
    throw error;
  }
}

/**
 * Stub kept for compatibility (bulk seeds are managed on the database/backend layer if desired).
 */
export async function seedReviewsForProducts(products) {
  return Promise.resolve();
}

/**
 * Stub kept for compatibility when removing a product.
 */
export async function deleteReviewsForProduct(productId) {
  return Promise.resolve();
}
