import { http } from "../api/http.js";
import { cancelOrder } from "../api/order.js";

const params = new URLSearchParams(location.search);
const orderId = params.get('id');

const idEl = document.getElementById('orderId');
const statusEl = document.getElementById('orderStatus');
const itemsEl = document.getElementById('orderItems');
const subEl = document.getElementById('odSubtotal');
const discEl = document.getElementById('odDiscount');
const shipEl = document.getElementById('odShipping');
const totalEl = document.getElementById('odTotal');
const cancelBox = document.getElementById('odCancel');
const timelineBox = document.getElementById('statusTimeline');

init();

async function init() {
  if (!orderId) { itemsEl.innerHTML = `<p class="text-gray-500">No order id</p>`; return; }
  idEl.textContent = `#${orderId}`;
  try {
    const order = await http(`/api/order/${orderId}`);
    render(order);
    bind(order);
  } catch (e) {
    itemsEl.innerHTML = `<p class="text-gray-500">Failed to load order</p>`;
  }
}

function render(o) {
  statusEl.textContent = o.orderStatus || 'PLACED';
  const items = o.orderItems || [];
  itemsEl.innerHTML = items.map(it => `
    <div class="flex items-center gap-3 border rounded p-3">
      <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden">
        <img src="${Array.isArray(it.product?.images) ? it.product.images[0] : it.product?.image || 'images/product1.jpg'}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex-1">
        <div class="text-sm">${it.product?.title || 'Product'}</div>
        <div class="text-xs text-gray-600">Qty: ${it.quantity || 1}</div>
      </div>
      <div class="text-sm">₹${(it.sellingPrice || it.price || 0).toFixed(2)}</div>
    </div>
  `).join('');

  const subtotal = items.reduce((s, it) => s + (it.sellingPrice || it.price || 0) * (it.quantity || 1), 0);
  const shipping = 0;
  const discount = 0; // unknown at item level; backend cart already applied if any
  subEl.textContent = `₹${subtotal.toFixed(2)}`;
  discEl.textContent = `₹${discount.toFixed(2)}`;
  shipEl.textContent = `₹${shipping.toFixed(2)}`;
  totalEl.textContent = `₹${(subtotal - discount + shipping).toFixed(2)}`;
  renderTimeline(o.orderStatus);
}

function bind(o) {
  const status = (o.orderStatus || '').toUpperCase();
  const canCancel = status === 'PENDING' || status === 'PLACED' || status === 'CONFIRMED';
  if (!cancelBox) return;
  cancelBox.innerHTML = canCancel ? `<button id="cancelBtn" class="px-4 py-2 border rounded">Cancel order</button>` : '';
  const btn = document.getElementById('cancelBtn');
  btn?.addEventListener('click', async () => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelOrder(o.id);
      location.reload();
    } catch (err) {
      alert(`Cancel failed: ${err?.message || 'Unknown error'}`);
    }
  });
}

function renderTimeline(status) {
  if (!timelineBox) return;
  const steps = ['PENDING', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const s = (status || 'PENDING').toUpperCase();
  const currentIdx = steps.indexOf(s);
  const effectiveIdx = s === 'CANCELLED' ? steps.indexOf('PLACED') : currentIdx;
  const active = new Set(steps.slice(0, (effectiveIdx >= 0 ? effectiveIdx + 1 : 1)));
  const label = (name) => name.charAt(0) + name.slice(1).toLowerCase();
  timelineBox.innerHTML = `
    <div class="grid grid-cols-5 gap-2 text-xs">
      ${['PLACED','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'].map((step, idx) => {
        const isActive = active.has(step) || (s === 'CANCELLED' && step === 'CANCELLED');
        const color = step === 'CANCELLED' && s !== 'CANCELLED' ? 'text-gray-400' : (isActive ? 'text-green-600' : 'text-gray-400');
        const dot = step === 'CANCELLED' && s !== 'CANCELLED' ? 'bg-gray-300' : (isActive ? 'bg-green-500' : 'bg-gray-300');
        return `
          <div class="flex flex-col items-center">
            <div class="w-2 h-2 rounded-full ${dot}"></div>
            <div class="mt-1 ${color}">${label(step)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}


