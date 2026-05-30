export function computeProductRating(reviews) {
  if (!reviews?.length) {
    return { rating: 0, reviewCount: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const reviewCount = reviews.length;
  const rating = Math.round((sum / reviewCount) * 10) / 10;
  return { rating, reviewCount };
}

export function sortReviewsNewest(reviews) {
  return [...reviews].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
