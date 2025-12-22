import { http } from "./http.js";

export function getCart() {
  return http(`/api/cart`);
}

export function addToCart({ productId, size = "M", quantity = 1 }) {
  return http(`/api/cart/add`, {
    method: "PUT",
    body: JSON.stringify({ productId, size, quantity })
  });
}

export function updateCartItem(cartItemId, data) {
  return http(`/api/cart/item/${cartItemId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function removeCartItem(cartItemId) {
  return http(`/api/cart/item/${cartItemId}`, { method: "DELETE" });
}

