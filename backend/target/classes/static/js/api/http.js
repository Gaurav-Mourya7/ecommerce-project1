const BASE_URL = "http://localhost:8080"; // backend ka base URL

function pickTokenForEndpoint(endpoint) {
  const raw = localStorage.getItem('jwt');
  // Role-scoped tokens take priority if available
  if (endpoint.startsWith('/users') || endpoint.startsWith('/api/cart') || endpoint.startsWith('/api/order') || endpoint.startsWith('/api/wishList')) {
    return localStorage.getItem('jwt_user') || raw;
  }
  if (endpoint.startsWith('/sellers') || endpoint.startsWith('/seller/') || endpoint.startsWith('/api/transactions/seller')) {
    return localStorage.getItem('jwt_seller') || raw;
  }
  if (endpoint.startsWith('/admin') || endpoint.startsWith('/api/admin')) {
    return localStorage.getItem('jwt_admin') || raw;
  }
  return raw;
}

export async function http(endpoint, options = {}) {
  const token = pickTokenForEndpoint(endpoint);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    // Handle no-content or non-JSON responses gracefully
    if (res.status === 204) return null;
    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    console.error(`Fetch failed for ${endpoint}:`, err.message);
    throw err; // frontend can catch and show fallback
  }
}
