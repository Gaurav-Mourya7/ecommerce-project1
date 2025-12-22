import { listProducts } from "../api/product.js";

const urlParams = new URLSearchParams(window.location.search);
const initialCategoryParam = urlParams.get('category');
const initialTypeParam = urlParams.get('type');

const grid = document.getElementById("productsGrid");
const resultMeta = document.getElementById("resultMeta");
const pagination = document.getElementById("pagination");
const filterForm = document.getElementById("filterForm");
const fType = document.getElementById("fType");
const fCategory = document.getElementById("fCategory");
const fMinPrice = document.getElementById("fMinPrice");
const fMaxPrice = document.getElementById("fMaxPrice");
const fColor = document.getElementById("fColor");
const fSort = document.getElementById("fSort");
const searchForm = document.getElementById("searchForm");
const qInput = document.getElementById("q");

let pageNumber = parseInt(urlParams.get('page') || '0', 10);
let q = urlParams.get('q') || '';

init();

async function init() {
  setupEventListeners();
  await initializePageFromUrl();
  await load();
}

function setupEventListeners() {
  if (fType) {
    fType.addEventListener('change', handleTypeChange);
  }
  
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  if (filterForm) {
    filterForm.addEventListener('submit', handleFilterSubmit);
  }
  
  window.addEventListener('popstate', () => {
    const newParams = new URLSearchParams(window.location.search);
    pageNumber = parseInt(newParams.get('page') || '0', 10);
    q = newParams.get('q') || '';
    load();
  });
}

async function initializePageFromUrl() {
  if (!initialCategoryParam) return;

  if (searchForm) searchForm.classList.add('hidden');

  const typeWrap = document.getElementById("typeWrap");
  if (typeWrap) typeWrap.classList.remove('hidden');

  const categoryWrap = document.getElementById("categoryWrap");
  if (categoryWrap) categoryWrap.classList.add('hidden');

  // Always treat anything with a known base as a category for the filter
  const knownBases = ['men', 'women', 'kids', 'accessories', 'electronics', 'cosmetics'];
  const baseMatch = knownBases.find(b => initialCategoryParam === b);
  const slugMatch = knownBases.find(b => initialCategoryParam.startsWith(b + '_'));
  let baseCategory = initialCategoryParam;
  let selectedSlug = '';
  if (baseMatch) {
    selectedSlug = '';
  } else if (slugMatch) {
    baseCategory = slugMatch;
    selectedSlug = initialCategoryParam;
  }

  const options = buildTypeOptions(baseCategory);
  if (fType) {
    fType.innerHTML = options.map(o => `<option value="${o.slug}">${o.label}</option>`).join('');
    fType.value = selectedSlug;
  }

  if (fCategory) {
    fCategory.value = baseCategory;
  }

  if (q && qInput) {
    qInput.value = q;
  }
}


async function load() {
  // Debug: log filters on every load
  const filters = {
    pageNumber,
    category: fType?.value && fType.value !== '' ? fType.value : initialCategoryParam,
    minPrice: fMinPrice?.value || undefined,
    maxPrice: fMaxPrice?.value || undefined,
    color: fColor?.value || undefined,
    sort: fSort?.value || undefined,
    searchQuery: q || undefined
  };
  console.log('Apply clicked', filters);
  try {
    // Get the effective category based on type selection
    let effectiveCategory = initialCategoryParam;
    if (fType?.value && fType.value !== '') {
      effectiveCategory = fType.value;
    }

    // If 'All' is selected, set category to the base category (men/women/kids)
    if (fType?.value === '') {
      effectiveCategory = initialCategoryParam;
    }

    // Build the filters object
    const filters = {
      pageNumber,
      category: effectiveCategory,
      minPrice: fMinPrice?.value || undefined,
      maxPrice: fMaxPrice?.value || undefined,
      color: fColor?.value || undefined,
      sort: fSort?.value || undefined,
      searchQuery: q || undefined // This is only for title search
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    // Call the API
    const page = await listProducts(filters);

    // Robust frontend filtering for color, price, and sort (in case backend does not filter)
    let products = page.content || [];
    console.log('Before filtering - products count:', products.length, 'Sort value:', filters.sort);
    
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      products = products.filter(p => (p.title || '').toLowerCase().includes(searchLower));
    }
    if (filters.color && filters.color.trim() !== '') {
      const colorLower = filters.color.trim().toLowerCase();
      console.log('Filtering for color:', colorLower, 'Product colors:', products.map(p => p.color));
      products = products.filter(p => (p.color || '').trim().toLowerCase().includes(colorLower));
    }
    if (filters.minPrice && filters.minPrice !== "") {
      const min = Number(filters.minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => (p.sellingPrice ?? p.price ?? 0) >= min);
        console.log('After min price filter:', products.length, 'products');
      }
    }
    if (filters.maxPrice && filters.maxPrice !== "") {
      const max = Number(filters.maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => (p.sellingPrice ?? p.price ?? 0) <= max);
        console.log('After max price filter:', products.length, 'products');
      }
    }
    if (filters.sort && filters.sort !== '') {
      console.log('Applying sort:', filters.sort);
      if (filters.sort === 'price_low') {
        products = products.slice().sort((a, b) => (a.sellingPrice ?? a.price ?? 0) - (b.sellingPrice ?? b.price ?? 0));
        console.log('Sorted by price low to high');
      } else if (filters.sort === 'price_high') {
        products = products.slice().sort((a, b) => (b.sellingPrice ?? b.price ?? 0) - (a.sellingPrice ?? a.price ?? 0));
        console.log('Sorted by price high to low');
      }
    }
    
    console.log('Final products count:', products.length);

    // Update the UI
    renderProducts(products);
    renderPagination(page);

    // Update result count
    if (resultMeta) {
      const total = page.totalElements ?? 0;
      const from = (page.number ?? 0) * (page.size ?? 0) + (page.numberOfElements ? 1 : 0);
      const to = (page.number ?? 0) * (page.size ?? 0) + (page.numberOfElements ?? 0);
      resultMeta.textContent = total ? `Showing ${from}-${to} of ${total}` : 'No products found';
    }
  } catch (e) {
    console.error('Error loading products:', e);
    grid.innerHTML = `<p class="text-red-500">Failed to load products. Please try again later.</p>`;
  }
}


function handleTypeChange() {
  pageNumber = 0;
  const selectedType = fType.value;
  let newCategoryParam = initialCategoryParam;
  if (selectedType && selectedType !== '') {
    newCategoryParam = selectedType;
  } else {
    // Universal: Always reset to the correct main category for any slug
    const knownBases = ['men', 'women', 'kids', 'accessories', 'electronics', 'cosmetics'];
    const baseMatch = knownBases.find(b => initialCategoryParam === b);
    const slugMatch = knownBases.find(b => initialCategoryParam.startsWith(b + '_'));
    if (baseMatch) {
      newCategoryParam = initialCategoryParam;
    } else if (slugMatch) {
      newCategoryParam = slugMatch;
    } else {
      newCategoryParam = initialCategoryParam;
    }
  }
  // Update URL params
  const params = new URLSearchParams(window.location.search);
  params.set('category', newCategoryParam);
  params.delete('type'); // Remove any old type param
  if (params.has('page')) params.delete('page');
  window.location.search = params.toString();
}

function handleSearch(e) {
  e.preventDefault();
  q = qInput.value.trim();
  pageNumber = 0;
  persistToUrl();
  load();
}

function handleFilterSubmit(e) {
  e.preventDefault();
  pageNumber = 0;
  persistToUrl();
  load();
}

function persistToUrl() {
  const params = new URLSearchParams();
  
  if (pageNumber > 0) {
    params.set('page', pageNumber);
  }
  
  if (initialCategoryParam) {
    params.set('category', initialCategoryParam);
    
    if (fType?.value) {
      params.set('type', fType.value);
    }
  }
  
  if (q) {
    params.set('q', q);
  }
  
  if (fMinPrice?.value) params.set('minPrice', fMinPrice.value);
  if (fMaxPrice?.value) params.set('maxPrice', fMaxPrice.value);
  if (fColor?.value) params.set('color', fColor.value);
  if (fSort?.value) params.set('sort', fSort.value);
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
}

function buildTypeOptions(base) {
  const map = {
    men: [
      { label: 'All', slug: '' },
      { label: 'T-Shirts', slug: 'men_tshirt' },
      { label: 'Shirts', slug: 'men_shirt' },
      { label: 'Jeans', slug: 'men_jeans' },
      { label: 'Shoes', slug: 'men_shoes' },
      { label: 'Watches', slug: 'men_watch' },
      { label: 'Sunglasses', slug: 'men_sunglasses' }
    ],
    women: [
      { label: 'All', slug: '' },
      { label: 'Sarees', slug: 'women_saree' },
      { label: 'Tops', slug: 'women_top' },
      { label: 'Dresses', slug: 'women_dress' },
      { label: 'Jeans', slug: 'women_jeans' },
      { label: 'Shoes', slug: 'women_shoes' },
      { label: 'Handbags', slug: 'women_bag' },
      { label: 'Jewelry', slug: 'women_jewelry' }
    ],
    kids: [
      { label: 'All', slug: '' },
      { label: 'Hoodies', slug: 'kids_hoodie' },
      { label: 'T-Shirts', slug: 'kids_tshirt' },
      { label: 'Shirts', slug: 'kids_shirt' },
      { label: 'Shorts', slug: 'kids_shorts' },
      { label: 'Shoes', slug: 'kids_shoes' },
      { label: 'Toys', slug: 'kids_toys' }
    ],
    accessories: [
      { label: 'All', slug: '' },
      { label: 'Cosmetics', slug: 'accessories_cosmetics' },
      { label: 'Watches', slug: 'accessories_watch' },
      { label: 'Bags', slug: 'accessories_bag' },
      { label: 'Jewelry', slug: 'accessories_jewelry' },
      { label: 'Electronics', slug: 'accessories_electronics' }
    ],
    electronics: [
      { label: 'All', slug: '' },
      { label: 'Mobiles', slug: 'electronics_mobiles' },
      { label: 'Laptops', slug: 'electronics_laptops' },
      { label: 'Headphones', slug: 'electronics_headphones' },
      { label: 'Wearables', slug: 'electronics_wearables' },
      { label: 'Accessories', slug: 'electronics_accessories' }
    ],
    cosmetics: [
      { label: 'All', slug: '' },
      { label: 'Makeup', slug: 'cosmetics_makeup' },
      { label: 'Skincare', slug: 'cosmetics_skincare' },
      { label: 'Haircare', slug: 'cosmetics_haircare' },
      { label: 'Fragrance', slug: 'cosmetics_fragrance' }
    ]
  };
  
  if (base === 'accessories' || base === 'electronics') {
    // Combine both arrays, removing duplicate 'All'
    const acc = map['accessories'] || [];
    const elec = (map['electronics'] || []).filter(o => o.label !== 'All');
    return [...acc, ...elec];
  }
  return map[base] || [];
}

function renderProducts(products) {
  if (!products.length) {
    grid.innerHTML = `<p class="text-gray-500">No products found</p>`;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <a href="product-detail.html?id=${product.id}" class="group rounded-xl bg-white border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition overflow-hidden">
      <div class="aspect-[3/4] bg-gray-100 relative">
        <img src="${Array.isArray(product.images) ? product.images[0] : product.image || 'images/product1.jpg'}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" alt="${product.title || 'Product'}"/>
      </div>
      <div class="p-3">
        <h4 class="text-sm font-medium line-clamp-1">${product.title || 'Untitled'}</h4>
        <div class="mt-1 text-accent font-bold">₹${product.sellingPrice ?? product.price ?? 'N/A'}</div>
      </div>
    </a>
  `).join("");
}

function renderPagination(page) {
  const totalPages = page.totalPages ?? 1;
  const current = page.number ?? pageNumber;
  if (totalPages <= 1) { pagination.innerHTML = ""; return; }
  const buttons = [];
  const prevDisabled = current <= 0 ? 'opacity-50 pointer-events-none' : '';
  const nextDisabled = current >= totalPages - 1 ? 'opacity-50 pointer-events-none' : '';
  buttons.push(`<button data-move="-1" class="px-3 py-1 border rounded ${prevDisabled}">Prev</button>`);
  buttons.push(`<span class="text-sm">Page ${current + 1} of ${totalPages}</span>`);
  buttons.push(`<button data-move="1" class="px-3 py-1 border rounded ${nextDisabled}">Next</button>`);
  pagination.innerHTML = buttons.join("");
  pagination.querySelectorAll('button[data-move]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const move = Number(btn.getAttribute('data-move'));
      pageNumber = Math.min(Math.max(0, current + move), totalPages - 1);
      persistToUrl();
      load();
    });
  });
}

window.navigateToPage = function(page) {
  pageNumber = page - 1; 
  persistToUrl();
  load();
};
