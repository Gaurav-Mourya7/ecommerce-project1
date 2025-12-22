import { getCart, updateCartItem, removeCartItem } from "../api/cart.js";
import { applyCoupon } from "../api/coupon.js";

const itemsEl = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
let currentCart;

init();

async function init() {
  try {
    const cart = await getCart();
    currentCart = cart;
    render(cart);
    bind(cart);
  } catch (e) {
    itemsEl.innerHTML = `<p class="text-gray-500">Login required to view cart</p>`;
  }
}

function render(cart) {
  const items = cart?.cartItems || [];
  if (!items.length) {
    itemsEl.innerHTML = `<p class="text-gray-500">Your cart is empty</p>`;
  } else {
    itemsEl.innerHTML = items.map(it => `
      <div class="flex items-center gap-4 border rounded p-3">
        <div class="w-20 h-20 bg-gray-100 rounded overflow-hidden">
          <img src="${Array.isArray(it.product?.images) ? it.product.images[0] : it.product?.image || 'images/product1.jpg'}" class="w-full h-full object-cover"/>
        </div>
        <div class="flex-1">
          <div class="font-medium">${it.product?.title || 'Product'}</div>
          <div class="text-sm text-gray-600">Size: ${it.size || 'M'}</div>
          <div class="text-accent font-semibold">₹${it.price || it.product?.sellingPrice || it.product?.price || 'N/A'}</div>
          <div class="flex items-center gap-2 mt-2">
            <input data-id="${it.id}" class="qty border rounded px-2 py-1 w-16" type="number" min="1" value="${it.quantity || 1}"/>
            <button data-id="${it.id}" class="update px-3 py-1 border rounded">Update</button>
            <button data-id="${it.id}" class="remove px-3 py-1 border rounded">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }
  const subtotal = items.reduce((sum, it) => sum + (it.price || it.product?.sellingPrice || 0) * (it.quantity || 1), 0);
  const shipping = items.length ? 0 : 0;
  subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  shippingEl.textContent = `₹${shipping.toFixed(2)}`;
  const applied = cart?.couponCode;
  const total = subtotal + shipping;
  totalEl.textContent = `₹${total.toFixed(2)}${applied ? ` (coupon: ${applied})` : ''}`;
}

function bind(cart) {
  itemsEl.querySelectorAll('.update').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const qty = Number(itemsEl.querySelector(`.qty[data-id="${id}"]`).value) || 1;
      try {
        await updateCartItem(id, { quantity: qty });
        init();
      } catch (e) { console.error(e); }
    });
  });
  itemsEl.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await removeCartItem(id);
        init();
      } catch (e) { console.error(e); }
    });
  });

  // coupon apply/remove
  const summaryBox = document.querySelector('aside .border');
  if (summaryBox && !summaryBox.querySelector('#couponForm')) {
    const form = document.createElement('form');
    form.id = 'couponForm';
    form.className = 'mt-4 grid grid-cols-[1fr_auto] gap-2';
    form.innerHTML = `
      <input id="couponCode" class="border rounded px-3 py-2" placeholder="Coupon code" />
      <button class="px-4 py-2 rounded bg-black text-white">Apply</button>
      <button type="button" id="removeCoupon" class="col-span-2 text-sm underline text-gray-600">Remove coupon</button>
    `;
    summaryBox.appendChild(form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('couponCode').value.trim();
      if (!code) return;
      try {
        const orderValue = (currentCart?.cartItems || []).reduce((s,it)=> s + (it.price || it.product?.sellingPrice || 0) * (it.quantity||1), 0);
        currentCart = await applyCoupon({ apply: true, code, orderValue });
        render(currentCart);
        bind(currentCart);
      } catch (err) {
        alert('Coupon apply failed');
      }
    });
    form.querySelector('#removeCoupon').addEventListener('click', async () => {
      const code = currentCart?.couponCode;
      if (!code) return;
      try {
        const orderValue = (currentCart?.cartItems || []).reduce((s,it)=> s + (it.price || it.product?.sellingPrice || 0) * (it.quantity||1), 0);
        currentCart = await applyCoupon({ apply: false, code, orderValue });
        render(currentCart);
        bind(currentCart);
      } catch (err) {
        alert('Remove coupon failed');
      }
    });
  }
}


