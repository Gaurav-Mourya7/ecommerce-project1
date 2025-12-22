import { http } from "./http.js";

export function listReviews(productId) {
  return http(`/api/products/${productId}/reviews`);
}

export function addReview(productId, { reviewText, reviewRating = 5, productImages = [] }) {
  return http(`/api/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ reviewText, reviewRating, productImages })
  });
}

