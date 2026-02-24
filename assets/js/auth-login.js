/* auth-login.js */
import DB from './database.js';
import { setupNavbar, setupAccountDropdown, showToast, validateEmail, hashPassword } from './shared.js';

(async function() {
  await DB.init();
  setupNavbar();
  setupAccountDropdown();

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validateEmail(email)) {
      showToast('❌ Email inválido', 'error');
      return;
    }

    if (!password) {
      showToast('❌ Debes ingresar tu contraseña', 'error');
      return;
    }

    const user = DB.findUserByEmail(email);
    if (!user) {
      showToast('❌ Credenciales incorrectas', 'error');
      return;
    }

    const passHash = await hashPassword(password);
    if (passHash !== user.passHash) {
      showToast('❌ Credenciales incorrectas', 'error');
      return;
    }

    if (!user.verified) {
      showToast('⏳ Tu cuenta no está verificada. Revisa tu correo', 'error');
      return;
    }

    // Guardar sesión
    localStorage.setItem('zyrix_session', JSON.stringify({
      email: user.email,
      role: user.role
    }));

    showToast('✅ ¡Bienvenido! Iniciando sesión...', 'success');
    setTimeout(() => window.location.href = user.role === 'admin' ? 'admin.html' : 'cuenta.html', 1500);
  });
})();
