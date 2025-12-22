import { http } from "../api/http.js";

document.addEventListener("DOMContentLoaded", initHomepage);

async function initHomepage() {
  try {
    console.log("Initializing homepage...");
    
    // Fetch products with better error handling
    const results = await Promise.allSettled([
      http("/products?pageNumber=0"), // New Products = latest
      http("/products?minDiscount=30&pageNumber=0") // Hot Trend
    ]);
    
    console.log("API responses received:", results);
    
    // Debug: Log full API response for new products
    if (results[0].status === 'fulfilled') {
      console.log("Full new products API response:", results[0].value);
    }
    
    // Debug: Log full API response for hot trend
    if (results[1].status === 'fulfilled') {
      console.log("Full hot trend API response:", results[1].value);
    }
    
    // Process new products
    if (results[0].status === 'fulfilled' && results[0].value) {
      const products = results[0].value;
      console.log("New products data:", products);
      
      if (products.content && Array.isArray(products.content)) {
        renderProducts(products.content);
      } else {
        console.error("Invalid products data structure:", products);
        document.getElementById("newProducts").innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load products</p>`;
      }
    } else {
      console.error("Failed to fetch new products:", results[0].reason);
      document.getElementById("newProducts").innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load products</p>`;
    }
    
    // Process hot trend products
    if (results[1].status === 'fulfilled' && results[1].value) {
      const hot = results[1].value;
      console.log("Hot trend data:", hot);
      
      if (hot.content && Array.isArray(hot.content)) {
        renderHotTrend(hot.content);
      } else {
        console.error("Invalid hot trend data structure:", hot);
        document.getElementById("hotTrend").innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load trending products</p>`;
      }
    } else {
      console.error("Failed to fetch hot trend products:", results[1].reason);
      document.getElementById("hotTrend").innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load trending products</p>`;
    }
  } catch (err) {
    console.error("Homepage load error:", err.message);
    showFallbackUI();
  }
  
  // Move initFilters outside try-catch to avoid selector errors affecting product loading
  try {
    initFilters();
  } catch (filterErr) {
    console.error("Filter initialization error:", filterErr.message);
  }
}

function renderProducts(items) {
  const container = document.getElementById("newProducts");
  if (!items.length) {
    container.innerHTML = `<p class="text-gray-500 text-center py-6">No products available</p>`;
    return;
  }
  
  console.log("Products to render:", items); // Debug log to see what data we're getting
  
  // Don't filter out products with quantity 0
  // Let's show all products regardless of quantity
  container.innerHTML = items.map(p => {
    // Debug log for each product
    console.log("Processing product:", p);
    
    // Handle image path correctly
    let imagePath = './images/placeholder.png'; // Default fallback image
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      imagePath = p.images[0];
    } else if (p.image) {
      imagePath = p.image;
    }
    
    // Add stock status indicator
    const isInStock = p.quantity > 0;
    const stockStatusClass = isInStock ? 'bg-green-500' : 'bg-red-500';
    const stockStatusText = isInStock ? 'In Stock' : 'Out of Stock';
    
    return `
    <a href="product-detail.html?id=${p.id}" class="block">
      <article class="group rounded bg-white shadow-sm hover:-translate-y-1 hover:shadow-smooth transition">
        <div class="h-72 bg-gray-100 rounded-t relative overflow-hidden">
          <img src="${imagePath}"
               alt="${p.title || 'Product'}"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               loading="lazy" 
               onerror="this.src='./images/placeholder.png'" />
          ${p.discountPercent ? `<span class="absolute left-3 top-3 text-[10px] font-semibold text-white bg-emerald-500 rounded px-2 py-1">-${p.discountPercent}%</span>` : ""}
          <span class="absolute right-3 top-3 text-[10px] font-semibold text-white ${stockStatusClass} rounded px-2 py-1">${stockStatusText}</span>
        </div>
        <div class="p-3 text-center">
          <h4 class="text-sm font-medium">${p.title || "Untitled"}</h4>
          <div class="text-yellow-400 text-xs my-1">${"★".repeat(Math.min(5, Math.round(p.numRatings || 0)))}</div>
          <div class="text-accent font-bold">₹${p.sellingPrice ?? p.mrpPrice ?? "N/A"}</div>
        </div>
      </article>
    </a>
  `}).join("");
}

function initFilters() {
  // Fix selector to target the category tabs correctly
  const tabs = document.querySelectorAll('.max-w-\[1200px\] .flex.flex-wrap.gap-4 li');
  
  if (!tabs || tabs.length === 0) {
    console.warn("Category tabs not found, trying alternative selector");
    // Try alternative selector
    const altTabs = document.querySelectorAll('ul li a');
    if (altTabs && altTabs.length > 0) {
      console.log("Found alternative tabs:", altTabs.length);
      // These already have href attributes, no need to add click handlers
    }
    return;
  }
  
  console.log("Found category tabs:", tabs.length);
  
  const labelToCategory = {
    "Women's": 'women',
    "Men's": 'men',
    "Kid's": 'kids',
    "Accessories & Cosmetics": 'accessories'
  };
  
  tabs.forEach(li => {
    li.addEventListener('click', async () => {
      const label = li.textContent.trim();
      const category = labelToCategory[label];
      // Navigate to products page with category (consistent with navbar/cards)
      const url = category ? `products.html?category=${encodeURIComponent(category)}` : 'products.html';
      location.href = url;
    });
  });
}

// Reviews disabled on homepage for now to avoid 404 when backend data not ready

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function showFallbackUI() {
  // Show more descriptive error messages with retry button
  const newProductsEl = document.getElementById("newProducts");
  if (newProductsEl) {
    newProductsEl.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-500 mb-3">Unable to load products</p>
        <button id="retryProducts" class="px-4 py-2 bg-accent text-white rounded hover:bg-red-600 transition">Retry</button>
      </div>
    `;
    document.getElementById("retryProducts")?.addEventListener("click", () => {
      newProductsEl.innerHTML = `<p class="text-gray-500 text-center py-6">Loading products...</p>`;
      initHomepage();
    });
  }
  
  const hotTrendEl = document.getElementById("hotTrend");
  if (hotTrendEl) {
    hotTrendEl.innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load trending products</p>`;
  }
  
  const reviewsEl = document.getElementById("reviewsSection");
  if (reviewsEl) {
    reviewsEl.innerHTML = `<p class="text-gray-500 text-center py-6">Unable to load reviews</p>`;
  }
  
  console.error("Showing fallback UI due to errors loading content");
}

function renderHotTrend(items) {
  const container = document.getElementById('hotTrend');
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `<p class="text-gray-500 text-center py-6">No trending products</p>`;
    return;
  }
  
  console.log("Hot trend products to render:", items); // Debug log
  
  // Show all trending products regardless of quantity
  container.innerHTML = items.slice(0, 6).map(p => {
    // Handle image path correctly
    let imagePath = './images/placeholder.png'; // Default fallback image
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      imagePath = p.images[0];
    } else if (p.image) {
      imagePath = p.image;
    }
    
    // Add stock status indicator
    const isInStock = p.quantity > 0;
    const stockStatusClass = isInStock ? 'bg-green-500' : 'bg-red-500';
    const stockStatusText = isInStock ? 'In Stock' : 'Out of Stock';
    
    return `
    <a href="product-detail.html?id=${p.id}" class="block">
      <article class="rounded bg-white p-5 text-center shadow-smooth hover:-translate-y-1 transition" data-aos="zoom-in">
        <div class="h-72 bg-gray-100 rounded-t overflow-hidden relative">
          <img src="${imagePath}" 
               alt="${p.title || 'Product'}" 
               class="w-full h-full object-cover" 
               loading="lazy" 
               onerror="this.src='./images/placeholder.png'" />
          <span class="absolute right-3 top-3 text-[10px] font-semibold text-white ${stockStatusClass} rounded px-2 py-1">${stockStatusText}</span>
        </div>
        <h4 class="text-sm font-medium">${p.title || ''}</h4>
        <div class="text-yellow-400 text-xs my-1 tracking-widest">${"★".repeat(Math.min(5, Math.round(p.numRatings || 0)))}</div>
        <div class="text-accent font-bold">₹${p.sellingPrice ?? p.mrpPrice ?? 'N/A'}</div>
      </article>
    </a>
  `}).join('');
}
