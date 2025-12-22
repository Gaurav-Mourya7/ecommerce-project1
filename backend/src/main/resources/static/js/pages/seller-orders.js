import { listSellerOrders, updateSellerOrderStatus } from "../api/seller.js";

const root = document.getElementById('sellerOrdersRoot');

init();

async function init() {
  try {
    await renderList();
  } catch (e) {
    root.innerHTML = `<p class="text-gray-500">Failed to load orders</p>`;
  }
}

async function renderList() {
  const orders = await listSellerOrders();
  root.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Orders</h1>
    <div class="space-y-3">
      ${orders.map(o => `
        <div class="bg-white border rounded p-3" data-id="${o.id}">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold">Order #${o.id}</div>
              <div class="text-sm text-gray-600">Items: ${o.orderItems?.length || 0} • Rs ${o.totalSellingPrice || 0}</div>
              <div class="text-sm">Status: <span class="text-xs px-2 py-1 rounded border">${o.orderStatus}</span></div>
            </div>
            <div class="flex items-center gap-2">
              ${renderStatusButtons(o.orderStatus)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  root.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const wrap = btn.closest('[data-id]');
      const id = wrap.getAttribute('data-id');
      const status = btn.getAttribute('data-status');
      await updateSellerOrderStatus(id, status);
      await renderList();
    });
  });
}

function renderStatusButtons(current) {
  const statuses = ['CONFIRMED','SHIPPED','DELIVERED','CANCELLED'];
  return statuses.map(s => `<button data-status="${s}" class="px-2 py-1 text-sm border rounded ${s===current?'opacity-40 cursor-default':''}" ${s===current?'disabled':''}>${s}</button>`).join('');
}


