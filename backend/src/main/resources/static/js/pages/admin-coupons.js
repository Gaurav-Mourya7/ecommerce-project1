import { requireAdmin } from "../utils/guard.js";
import { listCoupons, createCoupon, deleteCoupon } from "../api/admin.js";

requireAdmin('admin-coupons.html');

const listEl = document.getElementById('couponList');
const form = document.getElementById('couponForm');
const codeInput = document.getElementById('c_code');
const discountInput = document.getElementById('c_discount');

init();

async function init() {
  await renderList();
  bindForm();
}

async function renderList() {
  try {
    const coupons = await listCoupons();
    listEl.innerHTML = (coupons || []).map(c => `
      <div class="flex items-center justify-between border rounded p-3">
        <div>
          <div class="font-medium">${c.code}</div>
          <div class="text-sm text-gray-600">${c.discountPercentage || 0}% off</div>
        </div>
        <button data-del-id="${c.id}" class="px-3 py-1.5 border rounded text-sm">Delete</button>
      </div>
    `).join('') || `<p class="text-gray-500">No coupons</p>`;

    listEl.querySelectorAll('[data-del-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-del-id');
        if (!confirm('Delete this coupon?')) return;
        try {
          await deleteCoupon(id);
          await renderList();
        } catch (e) {
          showError('Delete failed');
        }
      });
    });
  } catch (e) {
    listEl.innerHTML = `<p class="text-gray-500">Failed to load coupons</p>`;
  }
}

function bindForm() {
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const code = (codeInput?.value || '').trim();
    const discountVal = Number(discountInput?.value);

    // Basic validation with red highlight
    let hasErr = false;
    if (!code) { markError(codeInput); hasErr = true; }
    if (!Number.isFinite(discountVal) || discountVal <= 0) { markError(discountInput); hasErr = true; }
    if (hasErr) { showError('Enter valid code and percentage'); return; }

    try {
      await createCoupon({ code, discountPercentage: discountVal, minimumOrderValue: 0 });
      form.reset?.();
      await renderList();
    } catch (e2) {
      showError(e2?.message || 'Create failed');
    }
  });
}

function markError(input) {
  if (!input) return;
  input.classList.add('ring-2','ring-red-400','outline-none');
}

function clearErrors() {
  [codeInput, discountInput].forEach(i => i && i.classList.remove('ring-2','ring-red-400','outline-none'));
  const old = document.getElementById('couponErr');
  if (old) old.remove();
}

function showError(msg) {
  clearErrors();
  const p = document.createElement('p');
  p.id = 'couponErr';
  p.className = 'text-sm text-red-600 mt-2';
  p.textContent = msg || 'Something went wrong';
  form?.parentNode?.insertBefore(p, form.nextSibling);
}


