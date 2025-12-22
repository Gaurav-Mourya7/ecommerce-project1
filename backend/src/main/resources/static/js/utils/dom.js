import { getJwt, logout, getAvatar } from "./storage.js";

export function initAuthUI() {
  const jwt = getJwt();
  document.querySelectorAll('[data-auth="in"]').forEach((el) => {
    el.classList.toggle('hidden', !jwt);
  });
  document.querySelectorAll('[data-auth="out"]').forEach((el) => {
    el.classList.toggle('hidden', !!jwt);
  });
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.classList.remove('hidden');
  logoutBtn?.addEventListener('click', () => {
    logout();
    location.reload();
  });
  const avatarUrl = getAvatar();
  const headImg = document.getElementById('headerAvatar');
  if (headImg && avatarUrl) headImg.src = avatarUrl;
}

