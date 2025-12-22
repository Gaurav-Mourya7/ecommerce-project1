import { http } from "./http.js";

export function getSellerProfile() {
  return http(`/sellers/profile`);
}

export function getSellerReport() {
  return http(`/sellers/report`);
}

export function listSellerProducts() {
  return http(`/sellers/products`);
}

export function createSellerProduct(payload) {
  return http(`/sellers/products`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateSellerProduct(productId, payload) {
  return http(`/sellers/products/${productId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteSellerProduct(productId) {
  return http(`/sellers/products/${productId}`, { method: 'DELETE' });
}

export function listSellerOrders() {
  return http(`/seller/order`);
}

export function updateSellerOrderStatus(orderId, status) {
  return http(`/seller/order/${orderId}/status/${status}`, { method: 'PATCH' });
}

export function listSellerTransactions() {
  return http(`/api/transactions/seller`);
}

// Auth flows
export function createSeller(payload) {
  return http(`/sellers`, { method: 'POST', body: JSON.stringify(payload) });
}

export function verifySellerOtp(otp) {
  return http(`/sellers/verify/otp/${otp}`, { method: 'PATCH' });
}

export function loginSeller({ email, otp }) {
  return http(`/sellers/login`, { method: 'POST', body: JSON.stringify({ email, otp }) });
}


