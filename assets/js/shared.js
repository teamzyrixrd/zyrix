/* shared.js - Funciones  compartidas */

// ========== TOAST NOTIFICATIONS ==========
export function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========== MODAL FUNCTIONS ==========
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// ========== NAVBAR SETUP ==========
export function setupNavbar() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href) && href !== 'index.html') {
      link.classList.add('active');
    } else if (href === 'index.html' && currentPath.endsWith('/')) {
      link.classList.add('active');
    }
  });
}

// ========== AUTH HELPERS ==========
export function isLoggedIn() {
  return localStorage.getItem('zyrix_session') !== null;
}

export function getCurrentUser() {
  const session = localStorage.getItem('zyrix_session');
  return session ? JSON.parse(session) : null;
}

export function logout() {
  localStorage.removeItem('zyrix_session');
  localStorage.removeItem('zyrix_cart_current');
  showToast('👋 Sesión cerrada', 'success');
  setTimeout(() => window.location.href = 'index.html', 1200);
}

// ========== ACCOUNT DROPDOWN SETUP ==========
export function setupAccountDropdown() {
  const user = getCurrentUser();
  const accountName = document.getElementById('accountName');
  const accountMenu = document.querySelector('.account-menu');

  if (!accountName || !accountMenu) return;

  if (user) {
    accountName.textContent = `👤 ${user.email}`;
    const dropdownItems = accountMenu.querySelector('.dropdown-menu');
    if (dropdownItems) {
      dropdownItems.innerHTML = `
        <button class="dropdown-item" onclick="window.location.href='cuenta.html'">📋 Mi Cuenta</button>
        ${user.role === 'admin' ? '<button class="dropdown-item" onclick="window.location.href=\'admin.html\'">⚙️ Admin</button>' : ''}
        <button class="dropdown-item" onclick="logout()">🚪 Cerrar Sesión</button>
      `;
    }
  } else {
    accountName.textContent = '👤 Invitado';
    const dropdownItems = accountMenu.querySelector('.dropdown-menu');
    if (dropdownItems) {
      dropdownItems.innerHTML = `
        <button class="dropdown-item" onclick="window.location.href='login.html'">🔐 Iniciar Sesión</button>
        <button class="dropdown-item" onclick="window.location.href='register.html'">📝 Registrarse</button>
      `;
    }
  }
}

// ========== VALIDATION ==========
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateEmail(email) {
  const re = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^\d{3}-\d{3}$/;
  return re.test(phone);
}

export function validatePassword(password) {
  return password.length >= 8 && /\d/.test(password);
}

// ========== MAKE GLOBAL ==========
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;
