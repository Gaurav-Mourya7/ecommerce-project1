import { login, sendOtp } from "../api/auth.js";

const form = document.getElementById("loginForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const otp = document.getElementById('otp').value;
  try {
    const res = await login({ email, otp });
    if (res?.jwt) {
      localStorage.setItem('jwt', res.jwt);
      try {
        const role = res?.role || 'ROLE_CUSTOMER';
        if (role === 'ROLE_ADMIN') {
          localStorage.setItem('jwt_admin', res.jwt);
          alert('Admin login successful');
          location.href = 'admin-dashboard.html';
          return;
        }
        localStorage.setItem('jwt_user', res.jwt);
      } catch(_) {}
      alert('Login successful');
      const params = new URLSearchParams(location.search);
      const next = params.get('next');
      location.href = next || 'index.html';
    } else {
      alert('Login failed');
    }
  } catch (e) {
    alert('Login failed');
    console.error(e);
  }
});

document.getElementById('sendOtp')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  if (!email) { alert('Enter email'); return; }
  try {
    await sendOtp({ email, role: 'ROLE_CUSTOMER' });
    alert('OTP sent to your email');
  } catch (e) {
    alert('Failed to send OTP');
  }
});


