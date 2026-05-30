import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getSeedReviewsForProduct } from '@/data/reviewSeeds';
import { computeProductRating } from '@/lib/reviews';

const REVIEWS_COLLECTION = 'reviews';
const PRODUCTS_COLLECTION = 'products';

function seedReviewDocId(productId, index) {
  return `seed_${String(productId)}_${index}`;
}

export function listenToReviews(onUpdate, onError) {
  return onSnapshot(
    collection(db, REVIEWS_COLLECTION),
    (snapshot) => {
      const reviews = [];
      snapshot.forEach((docSnap) => {
        reviews.push({ id: docSnap.id, ...docSnap.data() });
      });
      reviews.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(reviews);
    },
    (error) => {
      console.warn('Reviews listener error:', error.message);
      if (onError) onError(error);
    }
  );
}

async function syncProductRating(productId) {
  const pid = String(productId);
  const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', pid));
  const snapshot = await getDocs(q);
  const reviews = [];
  snapshot.forEach((docSnap) => reviews.push(docSnap.data()));

  const { rating, reviewCount } = computeProductRating(reviews);
  await updateDoc(doc(db, PRODUCTS_COLLECTION, pid), { rating, reviewCount }).catch(() => {});
}

let seedReviewsPromise = null;

export async function seedReviewsForProducts(products) {
  if (!products?.length) return;

  if (seedReviewsPromise) {
    return seedReviewsPromise;
  }

  seedReviewsPromise = (async () => {
    try {
      const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
      const countByProduct = {};
      snapshot.forEach((docSnap) => {
        const pid = String(docSnap.data().productId);
        countByProduct[pid] = (countByProduct[pid] || 0) + 1;
      });

      const productsNeedingReviews = products.filter(
        (p) => !countByProduct[String(p.id)]
      );
      if (productsNeedingReviews.length === 0) {
        return;
      }

      let seeded = 0;
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const pid = String(product.id);
        if (countByProduct[pid] > 0) continue;

        const templates = getSeedReviewsForProduct(product, i);
        for (let j = 0; j < templates.length; j++) {
          const template = templates[j];
          const reviewRef = doc(db, REVIEWS_COLLECTION, seedReviewDocId(pid, j));
          await setDoc(
            reviewRef,
            {
              ...template,
              createdAt: new Date(
                Date.now() - (i * 3 + j + 1) * 86400000
              ).toISOString(),
            },
            { merge: true }
          );
          seeded += 1;
        }
        await syncProductRating(pid);
      }

      if (seeded > 0) {
        console.log(`Seeded ${seeded} product reviews into Firestore.`);
      }
    } catch (error) {
      if (error?.code === 'already-exists') {
        return;
      }
      console.warn('Review seed skipped:', error?.message || error);
    } finally {
      seedReviewsPromise = null;
    }
  })();

  return seedReviewsPromise;
}

export async function addReview({ productId, userId, authorName, rating, comment }) {
  const payload = {
    productId: String(productId),
    userId: userId || null,
    authorName: authorName.trim(),
    rating: Number(rating),
    comment: comment.trim(),
    isSeed: false,
    createdAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, REVIEWS_COLLECTION), payload);
  await syncProductRating(payload.productId);
  return { id: ref.id, ...payload };
}

export async function deleteReview(reviewId, productId) {
  await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
  await syncProductRating(productId);
}

export async function deleteReviewsForProduct(productId) {
  const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', String(productId)));
  const snapshot = await getDocs(q);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}
