import { http } from "./http.js";

export function createOrder(address, paymentMethod) {
  const params = new URLSearchParams({ paymentMethod });
  return http(`/api/order?${params.toString()}`, {
    method: "POST",
    body: JSON.stringify(address)
  });
}

export function listUserOrders() {
  return http(`/api/order/user`);
}

export function cancelOrder(orderId) {
  return http(`/api/order/${orderId}/cancel`, { method: 'PUT' });
}

