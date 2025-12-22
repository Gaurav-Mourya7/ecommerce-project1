import { http } from "./http.js";

// apply: 'true' to apply, 'false' to remove
export function applyCoupon({ apply, code, orderValue }) {
  const params = new URLSearchParams({ apply: String(apply), code, orderValue: String(orderValue ?? 0) });
  return http(`/api/coupons/apply?${params.toString()}`, { method: 'POST' });
}

