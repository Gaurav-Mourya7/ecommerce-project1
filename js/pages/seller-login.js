import { createSeller, verifySellerOtp, loginSeller } from "../api/seller.js";
import { sendOtp } from "../api/auth.js";

const createForm = document.getElementById('createSellerForm');
const verifyForm = document.getElementById('verifyForm');
const loginForm = document.getElementById('loginForm');

createForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = collectSignupPayload();
  try {
    await createSeller(payload);
    alert('Seller successfully created! Check your email.');
    document.getElementById('createOut').textContent = 'Seller created. Check email for OTP.';
  } catch (err) {
    document.getElementById('createOut').textContent = `Failed: ${err?.message || 'Unknown error'}`;
  }
});

verifyForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const otp = document.getElementById('s_otp').value;
  try {
    await verifySellerOtp(otp);
    document.getElementById('verifyOut').textContent = 'Verified. You can login now.';
  } catch (err) {
    document.getElementById('verifyOut').textContent = `Failed: ${err?.message || 'Unknown error'}`;
  }
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('l_email').value;
  const otp = document.getElementById('l_otp').value;
  try {
    const res = await loginSeller({ email, otp });
    if (res?.jwt) {
      localStorage.setItem('jwt', res.jwt);
      // also store seller-scoped token to avoid conflicts with user/admin
      try { localStorage.setItem('jwt_seller', res.jwt); } catch(_) {}
      document.getElementById('loginOut').textContent = 'Logged in! Redirecting...';
      // redirect to seller dashboard after successful login
      setTimeout(() => { window.location.href = '/seller-dashboard.html'; }, 300);
    } else {
      document.getElementById('loginOut').textContent = 'No token in response.';
    }
  } catch (err) {
    document.getElementById('loginOut').textContent = `Failed: ${err?.message || 'Unknown error'}`;
  }
});

document.getElementById('btnSendOtp')?.addEventListener('click', async () => {
  const email = document.getElementById('l_email').value;
  if (!email) return alert('Enter email');
  try {
    await sendOtp({ email: `signing_${email}`, role: 'ROLE_SELLER' });
    alert('OTP sent to seller email');
  } catch (e) { alert('Failed to send OTP'); }
});

function collectSignupPayload() {
  return {
    sellerName: document.getElementById('s_sellerName').value,
    mobile: document.getElementById('s_mobile').value,
    email: document.getElementById('s_email').value,
    password: 'encrypted_password',
    businessDetails: {
      businessName: document.getElementById('b_name').value,
      businessEmail: document.getElementById('b_email').value || undefined,
      businessMobile: document.getElementById('b_mobile').value || undefined,
      businessAddress: document.getElementById('b_address').value || undefined,
    },
    bankDetails: {
      accountNumber: document.getElementById('bank_number').value,
      accountHolderName: document.getElementById('bank_holder').value,
      ifscCode: document.getElementById('bank_ifsc').value,
    },
    pickupAddress: {
      name: document.getElementById('p_name').value,
      localCity: document.getElementById('p_city').value,
      address: document.getElementById('p_address').value,
      city: document.getElementById('p_city').value,
      state: document.getElementById('p_state').value,
      pinCode: document.getElementById('p_pin').value,
      mobile: document.getElementById('p_mobile').value,
    },
    GSTIN: document.getElementById('s_gstin').value || undefined,
    role: 'ROLE_SELLER',
    isEmailVerified: false,
    accountStatus: 'PENDING_VERIFICATION',
  };
}


