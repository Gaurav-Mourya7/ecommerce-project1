import { getProduct } from "../api/product.js";
import { addToCart } from "../api/cart.js";
import { addToWishlist, getWishlist } from "../api/wishlist.js";
import { listReviews, addReview } from "../api/review.js";

const container = document.getElementById("productContainer");
const params = new URLSearchParams(location.search);
const productId = params.get("id");

init();

async function init() {
  if (!productId) {
    container.innerHTML = `<p class="text-gray-500">Product not found</p>`;
    return;
  }
  try {
    const p = await getProduct(productId);
    render(p);
    bind(p);
    await loadReviews();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="text-gray-500">Failed to load product</p>`;
  }
}

function render(p) {
  const image = Array.isArray(p.images) ? p.images[0] : p.image || 'images/product1.jpg';
  container.innerHTML = `
    <div>
      <div class="aspect-square bg-gray-100 rounded overflow-hidden">
        <img src="${image}" class="w-full h-full object-cover" alt="${p.title || 'Product'}"/>
      </div>
    </div>
    <div>
      <h1 class="text-2xl font-semibold mb-2">${p.title || 'Untitled'}</h1>
      <div class="text-accent text-2xl font-bold mb-2">₹${p.sellingPrice ?? p.price ?? 'N/A'}</div>
      <p class="text-sm text-gray-700 mb-4">${p.description || ''}</p>
      <div class="flex items-center gap-3 mb-4">
        <label class="text-sm">Size</label>
        <select id="size" class="border rounded px-3 py-2">
          <option value="S">S</option>
          <option value="M" selected>M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </select>
        <label class="text-sm">Qty</label>
        <input id="qty" type="number" min="1" value="1" class="w-20 border rounded px-3 py-2"/>
      </div>
      <div class="flex items-center gap-3">
        <button id="addBtn" class="px-5 py-3 rounded bg-black text-white">Add to cart</button>
        <button id="wishBtn" class="px-5 py-3 rounded border">Add to wishlist</button>
      </div>
      <div class="mt-8">
        <h2 class="font-semibold mb-2">Reviews</h2>
        <div id="reviewsList" class="space-y-3"></div>
        <form id="reviewForm" class="mt-3 grid gap-2 max-w-md">
          <div class="grid grid-cols-4 gap-2 items-center">
            <label class="text-sm col-span-1">Rating</label>
            <select id="revRating" class="border rounded px-3 py-2 col-span-3">
              <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
            </select>
          </div>
          <textarea id="revText" class="border rounded px-3 py-2" rows="3" placeholder="Write your review..."></textarea>
          <button class="px-4 py-2 rounded bg-black text-white w-max">Submit Review</button>
        </form>
      </div>
    </div>
  `;
}

async function bind(p) {
  const addBtn = document.getElementById('addBtn');
  addBtn?.addEventListener('click', async () => {
    const size = document.getElementById('size').value;
    const quantity = Number(document.getElementById('qty').value) || 1;
    try {
      await addToCart({ productId: p.id, size, quantity });
      addBtn.textContent = 'Added!';
      setTimeout(() => addBtn.textContent = 'Add to cart', 1200);
    } catch (e) {
      alert('Login required to add to cart');
      console.error(e);
    }
  });

  const wishBtn = document.getElementById('wishBtn');
  let inWishlist = false;
  try {
    const wl = await getWishlist();
    const items = wl?.products || wl?.wishListProducts || [];
    inWishlist = items.some((it) => (it.id ?? it.productId) === p.id);
  } catch {}
  setWishButtonState(wishBtn, inWishlist);

  wishBtn?.addEventListener('click', async () => {
    try {
      await addToWishlist(p.id);
      // re-check
      try {
        const wl = await getWishlist();
        const items = wl?.products || wl?.wishListProducts || [];
        inWishlist = items.some((it) => (it.id ?? it.productId) === p.id);
      } catch {}
      setWishButtonState(wishBtn, inWishlist);
    } catch (e) {
      alert('Login required to modify wishlist');
    }
  });

  const revForm = document.getElementById('reviewForm');
  revForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reviewRating = Number(document.getElementById('revRating').value) || 5;
    const reviewText = document.getElementById('revText').value.trim();
    if (!reviewText) { alert('Write something about the product'); return; }
    try {
      await addReview(p.id, { reviewText, reviewRating });
      document.getElementById('revText').value = '';
      await loadReviews();
    } catch (err) {
      alert('Login required to add review');
    }
  });
}

function setWishButtonState(btn, isIn) {
  if (!btn) return;
  if (isIn) {
    btn.textContent = 'Remove from wishlist';
    btn.className = 'px-5 py-3 rounded bg-white text-black border border-black';
  } else {
    btn.textContent = 'Add to wishlist';
    btn.className = 'px-5 py-3 rounded bg-white text-black border border-black';
  }
}

async function loadReviews() {
  try {
    const reviews = await listReviews(productId);
    const list = document.getElementById('reviewsList');
    if (!reviews?.length) { list.innerHTML = `<p class="text-gray-500">No reviews yet</p>`; return; }
    list.innerHTML = reviews.map(r => `
      <article class="border rounded p-3">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">${r.user?.fullName || 'User'}</div>
          <div class="text-xs text-yellow-500">${'★'.repeat(Math.round(r.rating || 0))}</div>
        </div>
        <p class="text-sm text-gray-700 mt-1">${r.reviewText || ''}</p>
      </article>
    `).join('');
  } catch (e) {
    // ignore
  }
}


