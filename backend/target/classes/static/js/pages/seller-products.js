import { listSellerProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct } from "../api/seller.js";
import { getAvailableImages, uploadImages } from "../api/static.js";

const root = document.getElementById('sellerProductsRoot');
let availableImages = [];

init();

async function init() {
  try {
    availableImages = await getAvailableImages();
    await renderList();
    bindCreateFormOnce();
  } catch (e) {
    root.innerHTML = `<p class="text-gray-500">Failed to load products</p>`;
  }
}

function createImageSelector(selectedImages = [], fieldPrefix = 'p') {
  const selectedImagesList = Array.isArray(selectedImages) ? selectedImages : [];
  
  return `
    <div class="image-selector">
      <label class="block text-sm font-medium mb-2">Product Images:</label>
      
      <!-- File Upload Section -->
      <div class="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <input type="file" 
               id="${fieldPrefix}_file_input" 
               multiple 
               accept="image/*" 
               class="hidden" />
        <label for="${fieldPrefix}_file_input" 
               class="cursor-pointer flex flex-col items-center justify-center py-4">
          <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <span class="text-sm text-gray-600">Click to upload images</span>
          <span class="text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</span>
        </label>
      </div>

      <!-- Selected Images Display -->
      <div class="selected-images mb-2" id="${fieldPrefix}_selected_images">
        ${selectedImagesList.map((img, index) => `
          <div class="inline-block mr-2 mb-2 p-2 border rounded bg-gray-50">
            <img src="${img}" alt="Selected" class="w-16 h-16 object-cover rounded mb-1">
            <div class="text-xs text-center">${img.split('/').pop()}</div>
            <button type="button" class="text-red-500 text-xs mt-1 remove-image" data-image="${img}" data-prefix="${fieldPrefix}">Remove</button>
          </div>
        `).join('')}
      </div>

      <input type="hidden" id="${fieldPrefix}_images" value="${selectedImagesList.join(',')}" />
    </div>
  `;
}

async function renderList() {
  const products = await listSellerProducts();
  root.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Products</h1>
    <div class="bg-white border rounded p-4 mb-6">
      <h2 class="font-medium mb-3">Create Product</h2>
      <form id="createForm" class="grid gap-2">
        <input id="p_title" class="border rounded px-3 py-2" placeholder="Title" />
        <textarea id="p_desc" class="border rounded px-3 py-2" placeholder="Description"></textarea>
        <div class="grid grid-cols-2 gap-2">
          <input id="p_mrp" type="number" class="border rounded px-3 py-2" placeholder="MRP" />
          <input id="p_sp" type="number" class="border rounded px-3 py-2" placeholder="Selling Price" />
        </div>
        <input id="p_color" class="border rounded px-3 py-2" placeholder="Color" />
        ${createImageSelector([], 'p')}
        <div class="grid grid-cols-3 gap-2">
          <input id="p_c1" class="border rounded px-3 py-2" placeholder="Category 1" />
          <input id="p_c2" class="border rounded px-3 py-2" placeholder="Category 2" />
          <input id="p_c3" class="border rounded px-3 py-2" placeholder="Category 3" />
        </div>
        <input id="p_sizes" class="border rounded px-3 py-2" placeholder="Sizes (e.g. S,M,L)" />
        <button class="px-4 py-2 rounded bg-black text-white w-max">Create Product</button>
      </form>
    </div>
    <div class="grid gap-3">
      ${products.map(p => `
        <div class="bg-white border rounded p-3" data-id="${p.id}">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-semibold">${p.title}</div>
              <div class="text-sm text-gray-600">${p.description || ''}</div>
              <div class="text-sm">Rs ${p.sellingPrice} <span class="line-through text-gray-400">${p.mrpPrice}</span></div>
              ${p.images && p.images.length > 0 ? `
                <div class="flex gap-1 mt-2">
                  ${p.images.slice(0, 3).map(img => `
                    <img src="${img}" alt="Product" class="w-12 h-12 object-cover rounded border">
                  `).join('')}
                  ${p.images.length > 3 ? `<div class="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs">+${p.images.length - 3}</div>` : ''}
                </div>
              ` : ''}
            </div>
            <div class="flex items-center gap-2">
              <button data-edit="${p.id}" class="px-2 py-1 text-sm border rounded">Edit</button>
              <button data-del="${p.id}" class="px-2 py-1 text-sm border rounded">Delete</button>
            </div>
          </div>
          <form class="hidden mt-3 grid gap-2" data-edit-form="${p.id}">
            <input class="e_title border rounded px-3 py-2" placeholder="Title" value="${(p.title||'').replace(/"/g,'&quot;')}" />
            <textarea class="e_desc border rounded px-3 py-2" placeholder="Description">${p.description || ''}</textarea>
            <div class="grid grid-cols-2 gap-2">
              <input class="e_mrp border rounded px-3 py-2" placeholder="MRP" type="number" value="${p.mrpPrice || 0}" />
              <input class="e_sp border rounded px-3 py-2" placeholder="Selling Price" type="number" value="${p.sellingPrice || 0}" />
            </div>
            <input class="e_color border rounded px-3 py-2" placeholder="Color" value="${p.color || ''}" />
            ${createImageSelector(p.images || [], `e_${p.id}`)}
            <div class="grid grid-cols-3 gap-2">
              <input class="e_c1 border rounded px-3 py-2" placeholder="Category 1" value="${p.category1 || ''}" />
              <input class="e_c2 border rounded px-3 py-2" placeholder="Category 2" value="${p.category2 || ''}" />
              <input class="e_c3 border rounded px-3 py-2" placeholder="Category 3" value="${p.category3 || ''}" />
            </div>
            <input class="e_sizes border rounded px-3 py-2" placeholder="Sizes" value="${p.sizes || ''}" />
            <div>
              <button data-save="${p.id}" class="px-3 py-1.5 text-sm rounded bg-black text-white">Save</button>
              <button type="button" data-cancel="${p.id}" class="px-3 py-1.5 text-sm border rounded">Cancel</button>
            </div>
          </form>
        </div>
      `).join('')}
    </div>
  `;

  bindImageSelectors();
  bindEditDeleteButtons();
}

function bindImageSelectors() {
  // Bind file upload inputs
  root.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        const prefix = input.id.replace('_file_input', '');
        await handleFileUpload(files, prefix);
      }
    });
  });

  // Bind remove image buttons
  root.querySelectorAll('.remove-image').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.getAttribute('data-prefix');
      const imageToRemove = btn.getAttribute('data-image');
      removeImageFromSelection(prefix, imageToRemove);
    });
  });
}

async function handleFileUpload(files, prefix) {
  try {
    // Show loading state
    const container = document.getElementById(`${prefix}_selected_images`);
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'inline-block mr-2 mb-2 p-2 border rounded bg-blue-50';
    loadingDiv.innerHTML = `
      <div class="w-16 h-16 bg-blue-100 rounded mb-1 flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
      <div class="text-xs text-center">Uploading...</div>
    `;
    container.appendChild(loadingDiv);

    // Upload files
    const uploadedImages = await uploadImages(files);
    
    // Remove loading state
    container.removeChild(loadingDiv);
    
    // Add uploaded images to selection
    uploadedImages.forEach(imagePath => {
      addImageToSelection(prefix, imagePath);
    });

    // Refresh available images list
    availableImages = await getAvailableImages();
    
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed. Please try again.');
  }
}

function addImageToSelection(prefix, imagePath) {
  const hiddenInput = document.getElementById(`${prefix}_images`);
  const currentImages = hiddenInput.value ? hiddenInput.value.split(',') : [];
  
  if (!currentImages.includes(imagePath)) {
    currentImages.push(imagePath);
    hiddenInput.value = currentImages.join(',');
    updateImageDisplay(prefix, currentImages);
  }
}

function removeImageFromSelection(prefix, imagePath) {
  const hiddenInput = document.getElementById(`${prefix}_images`);
  const currentImages = hiddenInput.value ? hiddenInput.value.split(',') : [];
  const updatedImages = currentImages.filter(img => img !== imagePath);
  
  hiddenInput.value = updatedImages.join(',');
  updateImageDisplay(prefix, updatedImages);
}

function updateImageDisplay(prefix, images) {
  const container = document.getElementById(`${prefix}_selected_images`);
  container.innerHTML = images.map((img, index) => `
    <div class="inline-block mr-2 mb-2 p-2 border rounded bg-gray-50">
      <img src="${img}" alt="Selected" class="w-16 h-16 object-cover rounded mb-1">
      <div class="text-xs text-center">${img.split('/').pop()}</div>
      <button type="button" class="text-red-500 text-xs mt-1 remove-image" data-image="${img}" data-prefix="${prefix}">Remove</button>
    </div>
  `).join('');
  
  // Re-bind remove buttons
  container.querySelectorAll('.remove-image').forEach(btn => {
    btn.addEventListener('click', () => {
      const imageToRemove = btn.getAttribute('data-image');
      removeImageFromSelection(prefix, imageToRemove);
    });
  });
}

function bindEditDeleteButtons() {
  // bind edit/delete
  root.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit');
      const f = root.querySelector(`[data-edit-form="${id}"]`);
      f?.classList.toggle('hidden');
      if (!f?.classList.contains('hidden')) {
        // Hook the c3 input inside this form
        const c3 = f.querySelector('.e_c3');
        const c1 = f.querySelector('.e_c1');
        const c2 = f.querySelector('.e_c2');
        c3?.addEventListener('input', () => {
          const { c1: nc1, c2: nc2 } = normalizeCategories(c1?.value, c2?.value, c3?.value);
          if (c1) c1.value = nc1;
          if (c2) c2.value = nc2;
        });
        bindImageSelectors();
      }
    });
  });
  root.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-cancel');
      const f = root.querySelector(`[data-edit-form="${id}"]`);
      f?.classList.add('hidden');
    });
  });
  root.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-save');
      const wrap = root.querySelector(`[data-id="${id}"]`);
      const payload = collectEditPayload(wrap, id);
      await updateSellerProduct(id, payload);
      await renderList();
    });
  });
  root.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete product?')) return;
      await deleteSellerProduct(id);
      await renderList();
    });
  });
}

function bindCreateFormOnce() {
  const form = document.getElementById('createForm');
  if (!form) return;

  // Auto-derive category1 and default category2 when user types category3
  const c3 = form.querySelector('#p_c3');
  const c1 = form.querySelector('#p_c1');
  const c2 = form.querySelector('#p_c2');
  c3?.addEventListener('input', () => {
    const { c1: nc1, c2: nc2 } = normalizeCategories(c1?.value, c2?.value, c3?.value);
    if (c1) c1.value = nc1;
    if (c2) c2.value = nc2;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = collectCreatePayload();
    await createSellerProduct(payload);
    form.reset();
    await renderList();
  });
}

function collectCreatePayload() {
  const imagesValue = document.getElementById('p_images').value;
  // Normalize categories before sending
  const rawC1 = document.getElementById('p_c1').value;
  const rawC2 = document.getElementById('p_c2').value;
  const rawC3 = document.getElementById('p_c3').value;
  const { c1, c2 } = normalizeCategories(rawC1, rawC2, rawC3);
  return {
    title: document.getElementById('p_title').value,
    description: document.getElementById('p_desc').value,
    mrpPrice: parseInt(document.getElementById('p_mrp').value || '0', 10),
    sellingPrice: parseInt(document.getElementById('p_sp').value || '0', 10),
    color: document.getElementById('p_color').value,
    images: imagesValue ? imagesValue.split(',').map(s => s.trim()).filter(Boolean) : [],
    category1: c1,
    category2: c2,
    category3: rawC3,
    sizes: document.getElementById('p_sizes').value,
  };
}

function collectEditPayload(wrap, productId) {
  const imagesValue = document.getElementById(`e_${productId}_images`).value;
  // Normalize categories before sending
  const rawC1 = wrap.querySelector('.e_c1').value;
  const rawC2 = wrap.querySelector('.e_c2').value;
  const rawC3 = wrap.querySelector('.e_c3').value;
  const { c1, c2 } = normalizeCategories(rawC1, rawC2, rawC3);
  return {
    title: wrap.querySelector('.e_title').value,
    description: wrap.querySelector('.e_desc').value,
    mrpPrice: parseInt(wrap.querySelector('.e_mrp').value || '0', 10),
    sellingPrice: parseInt(wrap.querySelector('.e_sp').value || '0', 10),
    color: wrap.querySelector('.e_color').value,
    images: imagesValue ? imagesValue.split(',').map(s => s.trim()).filter(Boolean) : [],
    category1: c1,
    category2: c2,
    category3: rawC3,
    sizes: wrap.querySelector('.e_sizes').value,
  };
}

// Helper to keep category hierarchy consistent on the client too
function normalizeCategories(c1, c2, c3) {
  let nc1 = c1 || '';
  const lc = (c3 || '').toLowerCase();
  if (lc.startsWith('men_')) nc1 = 'men';
  else if (lc.startsWith('women_')) nc1 = 'women';
  else if (lc.startsWith('kids_')) nc1 = 'kids';
  const nc2 = (c2 && c2.trim()) ? c2 : 'clothing';
  return { c1: nc1, c2: nc2 };
}
