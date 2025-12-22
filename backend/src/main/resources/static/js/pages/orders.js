import { listUserOrders, cancelOrder } from "../api/order.js";

const list = document.getElementById("ordersList");

init();

async function init() {
  try {
    const orders = await listUserOrders();
    if (!orders?.length) {
      list.innerHTML = `<p class="text-gray-500">No orders yet</p>`;
      return;
    }
    list.innerHTML = orders.map(o => renderOrder(o)).join("");
  } catch (e) {
    list.innerHTML = `<p class="text-gray-500">Login required to view orders</p>`;
  }
}

function renderOrder(o) {
  const items = o.orderItems || [];
  const total = items.reduce((s, it) => s + (it.sellingPrice || it.price || 0) * (it.quantity || 1), 0);
  const status = (o.orderStatus || '').toUpperCase();
  const cancellable = status === 'PENDING' || status === 'PLACED' || status === 'CONFIRMED';
  return `
    <a href="order-detail.html?id=${o.id}" class="border rounded p-4 block hover:shadow-sm transition">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">Order #${o.id}</div>
          <div class="text-sm text-gray-600">Status: ${o.orderStatus || 'PLACED'}</div>
        </div>
        <div class="font-semibold">₹${total.toFixed(2)}</div>
      </div>
      <div class="mt-3 grid gap-3">
        ${items.map(it => `
          <div class="flex items-center gap-3">
            <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden">
              <img src="${Array.isArray(it.product?.images) ? it.product.images[0] : it.product?.image || 'images/product1.jpg'}" class="w-full h-full object-cover"/>
            </div>
            <div class="flex-1">
              <div class="text-sm">${it.product?.title || 'Product'}</div>
              <div class="text-xs text-gray-600">Qty: ${it.quantity || 1}</div>
            </div>
            <div class="text-sm">₹${(it.sellingPrice || it.price || 0).toFixed(2)}</div>
          </div>
        `).join("")}
      </div>
    </a>
    ${cancellable ? `<div class="mt-2"><button data-cancel-id="${o.id}" class="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">Cancel order</button></div>` : ''}
  `;
}

// delegate cancel clicks
list.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-cancel-id]');
  if (!btn) return;
  const id = btn.getAttribute('data-cancel-id');
  if (!id) return;
  if (!confirm('Cancel this order?')) return;
  try {
    await cancelOrder(id);
    await init();
  } catch (err) {
    alert(`Cancel failed: ${err?.message || 'Unknown error'}`);
  }
});


