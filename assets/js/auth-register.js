/* auth-register.js */
import DB from './database.js';
import { setupNavbar, setupAccountDropdown, showToast, validateEmail, validatePhone, validatePassword } from './shared.js';

(async function() {
  await DB.init();
  setupNavbar();
  setupAccountDropdown();

  const registerForm = document.getElementById('registerForm');
  const verifyModal = document.getElementById('verifyModal');

  let pendingEmail = null;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;

    // Validaciones
    if (!firstName || !lastName) {
      showToast('❌ Ingresa tu nombre completo', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('❌ Email inválido', 'error');
      return;
    }

    if (DB.findUserByEmail(email)) {
      showToast('❌ Ya existe una cuenta con ese correo', 'error');
      return;
    }

    if (!validatePhone(phone)) {
      showToast('❌ Teléfono formato: xxx-xxx (ej: 809-123)', 'error');
      return;
    }

    if (!validatePassword(pass)) {
      showToast('❌ Contraseña: mín. 8 caracteres + 1 número', 'error');
      return;
    }

    if (pass !== pass2) {
      showToast('❌ Las contraseñas no coinciden', 'error');
      return;
    }

    // Crear usuario
    const verifyCode = DB.generateVerifyCode();
    const passHash = await DB.hashPassword(pass);

    await DB.saveUser({
      email,
      firstName,
      lastName,
      phone,
      passHash,
      role: 'user',
      verified: false,
      verifyCode
    });

    pendingEmail = email;
    sessionStorage.setItem('zyrix_pending_email', email);
    sessionStorage.setItem('zyrix_pending_code', verifyCode);

    showToast(`📧 Código enviado a ${email} (demo: ${verifyCode})`, 'info', 5000);

    // Mostrar modal de verificación
    verifyModal.classList.add('active');
    registerForm.style.display = 'none';
  });

  // Verificar código
  window.verifyEmail = function() {
    const code = document.getElementById('verifyCode').value.trim();
    const storedCode = sessionStorage.getItem('zyrix_pending_code');
    const email = sessionStorage.getItem('zyrix_pending_email');

    if (!code) {
      showToast('❌ Ingresa el código', 'error');
      return;
    }

    if (code !== storedCode) {
      showToast('❌ Código incorrecto', 'error');
      return;
    }

    // Activar cuenta
    DB.updateUser(email, { verified: true, verifyCode: null });
    sessionStorage.removeItem('zyrix_pending_email');
    sessionStorage.removeItem('zyrix_pending_code');

    showToast('✅ Cuenta verificada. Redirigiendo al login...', 'success');
    setTimeout(() => window.location.href = 'login.html', 1500);
  };

  // Reenviar código
  window.resendCode = function() {
    const email = sessionStorage.getItem('zyrix_pending_email');
    const code = sessionStorage.getItem('zyrix_pending_code');
    showToast(`📧 Código reenviado: ${code}`, 'info', 4000);
  };
})();
