import { getProfile, listAddresses, addAddress, deleteAddress, updateAddress } from "../api/user.js";
import { getAvatar, setAvatar } from "../utils/storage.js";

const card = document.getElementById('profileCard');

init();

async function init() {
  try {
    const user = await getProfile();
    render(user);
    bindAddressFormOnce();
    await renderAddresses();
  } catch (e) {
    console.error('Profile load failed:', e?.message || e);
    const msg = e?.message || '';
    if (typeof msg === 'string' && msg.includes('HTTP 403')) {
      try { localStorage.removeItem('jwt'); } catch(_) {}
      window.location.href = 'login.html?next=profile.html';
      return;
    }
    card.innerHTML = `<p class="text-gray-500">Failed to load profile (${msg || 'unknown error'}). <a href="login.html" class="underline">Login</a></p>`;
  }

  // init avatar click-to-upload
  const preview = document.getElementById('profileAvatarPreview');
  const saved = getAvatar();
  if (preview) { preview.src = saved || makeInitialsAvatar('U'); }
  const fileInput = document.getElementById('avatarFile');
  const btn = document.getElementById('avatarBtn');
  btn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatar(dataUrl);
      if (preview) preview.src = dataUrl;
      const headImg = document.getElementById('headerAvatar');
      if (headImg) headImg.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function render(u) {
  card.innerHTML = `
    <div class="flex items-center gap-4">
      <button id="avatarBtn" class="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden group" title="Change photo">
        <img id="profileAvatarPreview" class="w-full h-full object-cover" alt="Avatar"/>
        <span class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"></span>
      </button>
      <div>
        <div class="font-semibold">${u.fullName || ''}</div>
        <div class="text-sm text-gray-600">${u.email || ''}</div>
        <div class="text-xs text-gray-500 mt-1">Role: ${u.role || 'CUSTOMER'}</div>
      </div>
      <input id="avatarFile" type="file" accept="image/*" class="hidden" />
    </div>
    <div class="mt-6">
      <h2 class="text-lg font-semibold mb-2">Saved addresses</h2>
      <div id="addrList" class="space-y-3"></div>
      <form id="addrForm" class="mt-4 grid gap-2 max-w-xl">
        <div class="grid grid-cols-2 gap-2">
          <input id="a_name" class="border rounded px-3 py-2" placeholder="Name" />
          <input id="a_mobile" class="border rounded px-3 py-2" placeholder="Mobile" />
        </div>
        <input id="a_address" class="border rounded px-3 py-2" placeholder="Address" />
        <div class="grid grid-cols-3 gap-2">
          <input id="a_city" class="border rounded px-3 py-2" placeholder="City" />
          <input id="a_state" class="border rounded px-3 py-2" placeholder="State" />
          <input id="a_pin" class="border rounded px-3 py-2" placeholder="PIN Code" />
        </div>
        <button class="px-4 py-2 rounded bg-black text-white w-max">Add address</button>
      </form>
    </div>
  `;
}

function getInitials(name) {
  return (name || '').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() || 'U';
}

function makeInitialsAvatar(name) {
  const initials = getInitials(name);
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath(); ctx.arc(size/2,size/2,size/2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(initials, size/2, size/2);
  return canvas.toDataURL();
}

async function renderAddresses() {
  const list = document.getElementById('addrList');
  const form = document.getElementById('addrForm');
  try {
    const addrs = await listAddresses();
    const arr = Array.isArray(addrs) ? addrs : (addrs ? Array.from(addrs) : []);
    if (!arr.length) {
      list.innerHTML = `<p class="text-gray-500">No addresses saved</p>`;
    } else {
      list.innerHTML = arr.map(a => `
        <div class="border rounded p-3" data-addr-id="${a.id}">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium">${a.name || ''} <span class="text-xs text-gray-500">${a.mobile || ''}</span></div>
              <div class="text-sm text-gray-700">${a.address || ''}</div>
              <div class="text-sm text-gray-700">${a.city || ''}, ${a.state || ''} ${a.pinCode || ''}</div>
            </div>
            <div class="flex items-center gap-2">
              <button data-edit-id="${a.id}" class="px-2 py-1 text-sm border rounded">Edit</button>
              <button data-del-id="${a.id}" class="px-2 py-1 text-sm border rounded">Delete</button>
            </div>
          </div>
          <form data-edit-form="${a.id}" class="hidden mt-3 grid gap-2">
            <div class="grid grid-cols-2 gap-2">
              <input class="e_name border rounded px-3 py-2" placeholder="Name" value="${a.name || ''}" />
              <input class="e_mobile border rounded px-3 py-2" placeholder="Mobile" value="${a.mobile || ''}" />
            </div>
            <input class="e_address border rounded px-3 py-2" placeholder="Address" value="${(a.address||'').replace(/"/g,'&quot;')}" />
            <div class="grid grid-cols-3 gap-2">
              <input class="e_city border rounded px-3 py-2" placeholder="City" value="${a.city || ''}" />
              <input class="e_state border rounded px-3 py-2" placeholder="State" value="${a.state || ''}" />
              <input class="e_pin border rounded px-3 py-2" placeholder="PIN Code" value="${a.pinCode || ''}" />
            </div>
            <div class="flex items-center gap-2">
              <button data-save-id="${a.id}" class="px-3 py-1.5 text-sm rounded bg-black text-white">Save</button>
              <button type="button" data-cancel-id="${a.id}" class="px-3 py-1.5 text-sm border rounded">Cancel</button>
            </div>
          </form>
        </div>
      `).join('');
      list.querySelectorAll('[data-edit-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-id');
          const form = list.querySelector(`[data-edit-form="${id}"]`);
          form?.classList.toggle('hidden');
        });
      });
      list.querySelectorAll('[data-cancel-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-cancel-id');
          const form = list.querySelector(`[data-edit-form="${id}"]`);
          form?.classList.add('hidden');
        });
      });
      list.querySelectorAll('[data-save-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-save-id');
          const wrapper = list.querySelector(`[data-addr-id="${id}"]`);
          const form = list.querySelector(`[data-edit-form="${id}"]`);
          if (!wrapper || !form) return;
          btn.setAttribute('disabled','true');
          const payload = {
            name: wrapper.querySelector('.e_name').value,
            mobile: wrapper.querySelector('.e_mobile').value,
            address: wrapper.querySelector('.e_address').value,
            city: wrapper.querySelector('.e_city').value,
            state: wrapper.querySelector('.e_state').value,
            pinCode: wrapper.querySelector('.e_pin').value,
          };
          try {
            await updateAddress(id, payload);
            await renderAddresses();
          } catch (err) {
            alert(`Update failed: ${err?.message || 'Unknown error'}`);
          } finally {
            btn.removeAttribute('disabled');
          }
        });
      });
      list.querySelectorAll('[data-del-id]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-del-id');
          if (!confirm('Delete this address?')) return;
          try {
            await deleteAddress(id);
            await renderAddresses();
          } catch (e) { alert('Delete failed'); }
        });
      });
    }
  } catch (e) {
    list.innerHTML = `<p class="text-gray-500">Failed to load addresses</p>`;
  }
}

function bindAddressFormOnce() {
  const existing = document.getElementById('addrForm');
  if (!existing) return;
  // Hard-dedupe: replace node to drop any old listeners bound by previous renders
  const form = existing.cloneNode(true);
  existing.parentNode.replaceChild(form, existing);
  form.dataset.bound = '1';
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.loading === '1') return; // prevent double submits
    form.dataset.loading = '1';
    const submitBtn = form.querySelector('button');
    const prevText = submitBtn?.textContent;
    if (submitBtn) submitBtn.textContent = 'Adding...';
    submitBtn?.setAttribute('disabled', 'true');
    const payload = {
      name: document.getElementById('a_name').value,
      mobile: document.getElementById('a_mobile').value,
      address: document.getElementById('a_address').value,
      city: document.getElementById('a_city').value,
      localCity: document.getElementById('a_city').value,
      state: document.getElementById('a_state').value,
      pinCode: document.getElementById('a_pin').value,
    };
    try {
      await addAddress(payload);
      (e.target).reset?.();
      await renderAddresses();
    } catch (err) {
      alert(`Add failed: ${err?.message || 'Unknown error'}`);
    } finally {
      form.dataset.loading = '0';
      if (submitBtn) {
        submitBtn.textContent = prevText || 'Add address';
        submitBtn.removeAttribute('disabled');
      }
    }
  });
}

// removed profile save: updates happen via address forms only

