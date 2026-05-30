/** Dummy review templates — 2–3 per product, rotated by product index. */
const POOLS = [
  [
    {
      authorName: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely love this! My skin feels softer after just a week.',
    },
    {
      authorName: 'James K.',
      rating: 4,
      comment: 'Great quality and gentle formula. Will definitely repurchase.',
    },
    {
      authorName: 'Priya L.',
      rating: 5,
      comment: 'Perfect for my daily routine. Highly recommend to friends.',
    },
  ],
  [
    {
      authorName: 'Emma R.',
      rating: 5,
      comment: 'One of my favorite Olive Beauty finds. Smells amazing too.',
    },
    {
      authorName: 'Marcus T.',
      rating: 4,
      comment: 'Works well and absorbs quickly. No irritation on sensitive skin.',
    },
    {
      authorName: 'Nina P.',
      rating: 5,
      comment: 'Gentle, effective, and worth every penny. Five stars from me.',
    },
  ],
  [
    {
      authorName: 'Olivia H.',
      rating: 4,
      comment: 'Lovely texture and visible results. Happy with my purchase.',
    },
    {
      authorName: 'Daniel W.',
      rating: 5,
      comment: 'My partner noticed the difference too. Excellent product.',
    },
    {
      authorName: 'Aisha B.',
      rating: 4,
      comment: 'Clean ingredients and beautiful packaging. Very satisfied.',
    },
  ],
];

export function getSeedReviewsForProduct(product, productIndex) {
  const pool = POOLS[productIndex % POOLS.length];
  const count = productIndex % 3 === 0 ? 2 : 3;
  return pool.slice(0, count).map((review) => ({
    ...review,
    productId: String(product.id),
    isSeed: true,
    userId: null,
  }));
}
