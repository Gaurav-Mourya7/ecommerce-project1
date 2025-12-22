import { http } from "./http.js";

// Coupons (admin scope)
export function listCoupons() {
  return http(`/api/coupons/admin/all`);
}

export function createCoupon(payload) {
  return http(`/api/coupons/admin/create`, { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteCoupon(id) {
  return http(`/api/coupons/admin/delete/${id}`, { method: 'DELETE' });
}

// Sellers moderation
export function updateSellerStatus(id, status) {
  return http(`/api/admin/seller/${id}/status/${status}`, { method: 'PATCH' });
}

// Sellers listing for moderation
export function listSellers(status) {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  return http(`/api/admin/sellers${q}`);
}


