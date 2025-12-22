import { signup, sendOtp } from "../api/auth.js";

const form = document.getElementById("signupForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const otp = document.getElementById('otp').value;
  try {
    const res = await signup({ fullName, email, otp });
    if (res?.jwt) {
      localStorage.setItem('jwt', res.jwt);
      alert('Signup successful');
      location.href = 'index.html';
    } else {
      alert('Signup failed');
    }
  } catch (e) {
    alert('Signup failed');
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
    console.error('Send OTP failed:', e);
    alert(`Failed to send OTP${e?.message ? `: ${e.message}` : ''}`);
  }
});


