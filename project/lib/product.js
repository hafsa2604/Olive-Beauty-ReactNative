/** Normalize Firestore/local product records for stock display and cart limits. */
export function normalizeProduct(product) {
  if (!product) return product;
  const stock =
    product.stock !== undefined && product.stock !== null && product.stock !== ''
      ? Number(product.stock)
      : null;
  const inStock =
    product.inStock === true || (stock !== null && !Number.isNaN(stock) ? stock > 0 : true);

  return {
    ...product,
    stock: stock !== null && !Number.isNaN(stock) ? stock : inStock ? 50 : 0,
    inStock,
  };
}

export function getAvailableStock(product) {
  const normalized = normalizeProduct(product);
  return Math.max(0, Number(normalized.stock) || 0);
}
