export function requireUser(nextUrl) {
  const token = localStorage.getItem('jwt_user') || localStorage.getItem('jwt');
  if (!token) {
    const next = nextUrl || window.location.pathname.split('/').pop();
    window.location.href = `login.html?next=${encodeURIComponent(next)}`;
  }
}

export function requireSeller(nextUrl) {
  const token = localStorage.getItem('jwt_seller');
  if (!token) {
    const next = nextUrl || window.location.pathname.split('/').pop();
    window.location.href = `seller-login.html?next=${encodeURIComponent(next)}`;
  }
}

export function requireAdmin(nextUrl) {
  const token = localStorage.getItem('jwt_admin');
  if (!token) {
    const next = nextUrl || window.location.pathname.split('/').pop();
    window.location.href = `login.html?next=${encodeURIComponent(next)}`;
  }
}


