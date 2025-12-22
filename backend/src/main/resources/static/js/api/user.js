import { http } from "./http.js";

export function getProfile() {
  return http(`/users/profile`);
}

export function listAddresses() {
  return http(`/users/addresses`);
}

export function addAddress(payload) {
  return http(`/users/addresses`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateAddress(id, payload) {
  return http(`/users/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteAddress(id) {
  return http(`/users/addresses/${id}`, { method: 'DELETE' });
}

