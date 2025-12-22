import { getWishlist, addToWishlist } from "../api/wishlist.js";

const grid = document.getElementById("wishlistItems");

init();

async function init() {
  try {
    const wl = await getWishlist();
    const items = wl?.products || wl?.wishListProducts || [];
    if (!items.length) {
      grid.innerHTML = `<p class="text-gray-500">Your wishlist is empty</p>`;
      return;
    }
    grid.innerHTML = items.map(p => `
      <div class="group rounded bg-white shadow-sm hover:-translate-y-1 hover:shadow transition">
        <a href="product-detail.html?id=${p.id}" class="block">
          <div class="h-64 bg-gray-100 rounded-t overflow-hidden">
            <img src="${Array.isArray(p.images) ? p.images[0] : p.image || 'images/product1.jpg'}" class="w-full h-full object-cover group-hover:scale-105 transition" alt="${p.title || 'Product'}"/>
          </div>
          <div class="p-3 text-center">
            <h4 class="text-sm font-medium line-clamp-1">${p.title || 'Untitled'}</h4>
            <div class="text-accent font-bold">₹${p.sellingPrice ?? p.price ?? 'N/A'}</div>
          </div>
        </a>
        <div class="p-3 pt-0 text-center">
          <button data-remove-id="${p.id}" class="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">Remove</button>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll('[data-remove-id]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-remove-id');
        try {
          await addToWishlist(id);
          init();
        } catch (err) {
          alert(`Remove failed: ${err?.message || 'Unknown error'}`);
        }
      });
    });
  } catch (e) {
    grid.innerHTML = `<p class="text-gray-500">Login required to view wishlist</p>`;
  }
}


