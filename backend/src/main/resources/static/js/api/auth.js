import { http } from "./http.js";

export function sendOtp({ email, role = "ROLE_CUSTOMER" }) {
  return http(`/auth/sent/login-signup-otp`, {
    method: "POST",
    body: JSON.stringify({ email, role })
  });
}

export function login({ email, otp }) {
  return http(`/auth/signing`, {
    method: "POST",
    body: JSON.stringify({ email, otp })
  });
}

export function signup({ fullName, email, otp }) {
  return http(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify({ fullName, email, otp })
  });
}

