import { http } from "./http.js";

export function listProducts({
  pageNumber = 0,
  category,
  brand,
  color,
  sizes,
  minPrice,
  maxPrice,
  minDiscount,
  sort,
  stocks,
  q
} = {}) {
  const query = new URLSearchParams();
  if (category) query.set('category', category);
  if (brand) query.set('brand', brand);
  if (color) query.set('color', color);
  if (sizes) query.set('sizes', sizes);
  if (minPrice != null && minPrice !== '') query.set('minPrice', minPrice);
  if (maxPrice != null && maxPrice !== '') query.set('maxPrice', maxPrice);
  if (minDiscount != null && minDiscount !== '') query.set('minDiscount', minDiscount);
  if (sort) query.set('sort', sort);
  if (stocks) query.set('stocks', stocks);
  if (q) query.set('query', q);
  query.set('pageNumber', String(pageNumber));
  return http(`/products?${query.toString()}`);
}

export function getProduct(productId) {
  return http(`/products/${productId}`);
}

