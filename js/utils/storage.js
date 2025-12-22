export function getJwt() {
  return localStorage.getItem('jwt');
}

export function setJwt(token) {
  localStorage.setItem('jwt', token);
}

// role-scoped tokens
export function getRoleJwt(role) {
  return localStorage.getItem(roleKey(role));
}

export function setRoleJwt(role, token) {
  localStorage.setItem(roleKey(role), token);
}

export function clearRoleJwt(role) {
  localStorage.removeItem(roleKey(role));
}

function roleKey(role) {
  return role === 'ROLE_SELLER' ? 'jwt_seller'
       : role === 'ROLE_ADMIN' ? 'jwt_admin'
       : 'jwt_user';
}

export function logout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('jwt_user');
  localStorage.removeItem('jwt_seller');
  localStorage.removeItem('jwt_admin');
}

export function getAvatar() {
  return localStorage.getItem('avatarDataUrl') || '';
}

export function setAvatar(dataUrl) {
  localStorage.setItem('avatarDataUrl', dataUrl);
}

