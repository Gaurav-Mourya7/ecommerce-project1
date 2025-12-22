import { http } from "./http.js";

export function getWishlist() {
  return http(`/api/wishList`);
}

export function addToWishlist(productId) {
  return http(`/api/wishList/add-product/${productId}`, { method: "POST" });
}

