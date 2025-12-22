import { requireAdmin } from "../utils/guard.js";
import { listCoupons, listSellers, updateSellerStatus } from "../api/admin.js";

requireAdmin('admin-dashboard.html');

const root = document.getElementById('adminDashboardRoot');

init();

async function init() {
  try {
    const [coupons, pendingSellers] = await Promise.all([
      listCoupons(),
      listSellers('PENDING_VERIFICATION')
    ]);
    render(coupons || [], pendingSellers || []);
  } catch (e) {
    root.innerHTML = `<p class="text-gray-500">Failed to load admin dashboard</p>`;
  }
}

function render(coupons, pendingSellers) {
  const totalCoupons = coupons.length;
  root.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Admin Dashboard</h1>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${card("Total Coupons", totalCoupons)}
      ${card("Pending Sellers", pendingSellers.length)}
      ${card("Orders Today", "—")}
      ${card("Refunds Today", "—")}
    </div>
    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <section class="bg-white border rounded p-4">
        <h2 class="font-semibold mb-3">Recent Coupons</h2>
        <div class="divide-y">
          ${coupons.slice(0,6).map(c => `
            <div class="py-2 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">${c.code}</div>
                <div class="text-xs text-gray-500">${c.discount || c.discountPercentage || 0} off</div>
              </div>
              <a href="admin-coupons.html" class="text-xs underline">Manage</a>
            </div>
          `).join('') || `<div class="text-sm text-gray-500">No coupons</div>`}
        </div>
      </section>
      <section class="bg-white border rounded p-4">
        <h2 class="font-semibold mb-3">Pending Sellers</h2>
        <div class="divide-y">
          ${pendingSellers.slice(0,6).map(s => `
            <div class="py-2 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">${s.sellerName || s.email}</div>
                <div class="text-xs text-gray-500">${s.email}</div>
              </div>
              <div class="flex gap-2">
                <button data-approve="${s.id}" class="px-2 py-1 text-xs rounded border">Approve</button>
                <button data-reject="${s.id}" class="px-2 py-1 text-xs rounded border">Reject</button>
              </div>
            </div>
          `).join('') || `<div class="text-sm text-gray-500">No pending sellers</div>`}
        </div>
      </section>
    </div>
  `;

  root.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-approve');
      try { await updateSellerStatus(id, 'ACTIVE'); await init(); } catch(e) { alert('Approve failed'); }
    });
  });
  root.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-reject');
      try { await updateSellerStatus(id, 'SUSPENDED'); await init(); } catch(e) { alert('Reject failed'); }
    });
  });
}

function card(label, value) {
  return `
    <div class="bg-white border rounded p-4">
      <div class="text-xs text-gray-500">${label}</div>
      <div class="text-2xl font-semibold">${value}</div>
    </div>
  `;
}

function quickLink(label, href) {
  return `
    <a href="${href}" class="border rounded p-3 hover:bg-gray-50">${label}</a>
  `;
}


