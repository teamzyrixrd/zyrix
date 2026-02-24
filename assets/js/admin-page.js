/* admin-page.js */
import DB from './database.js';
import { setupNavbar, setupAccountDropdown, showToast, getCurrentUser } from './shared.js';

(async function() {
  await DB.init();
  setupNavbar();
  setupAccountDropdown();

  const adminContent = document.getElementById('adminContent');
  const notAdmin = document.getElementById('notAdmin');
  const user = getCurrentUser();

  // Verificar permisos
  if (!user || user.role !== 'admin') {
    adminContent.style.display = 'none';
    notAdmin.style.display = 'block';
    return;
  }

  adminContent.style.display = 'block';
  notAdmin.style.display = 'none';

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
    });
  });

  // Render stats
  function renderStats() {
    const stats = DB.getStats();
    document.getElementById('statUsers').textContent = stats.totalUsers;
    document.getElementById('statVerified').textContent = stats.verifiedUsers;
    document.getElementById('statRevenue').textContent = stats.totalRevenue.toLocaleString();
    document.getElementById('statProducts').textContent = stats.activeProducts;
  }

  // ===== USUARIOS =====
  function renderUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    const users = DB.getUsers();

    if (users.length === 0) {
      usersList.innerHTML = '<div class="card" style="text-align: center; padding: 24px;">No hay usuarios</div>';
      return;
    }

    users.forEach(u => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '12px';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${u.firstName} ${u.lastName}</strong>
            <p style="color: var(--text-muted); font-size: 12px; margin: 4px 0;">📧 ${u.email}</p>
            <p style="color: var(--text-muted); font-size: 12px;">📱 ${u.phone}</p>
            <p style="font-size: 12px;">
              ${u.verified ? '✅ Verificado' : '⏳ No verificado'} • 
              <strong style="color: var(--accent-primary);">${u.role.toUpperCase()}</strong>
            </p>
          </div>
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <button class="btn btn-secondary" style="padding: 8px; font-size: 12px;" onclick="editUser('${u.email}')">✏️ Editar</button>
            <button class="btn btn-secondary" style="padding: 8px; font-size: 12px;" onclick="toggleVerify('${u.email}', ${u.verified})">
              ${u.verified ? '❌' : '✅'} Verificar
            </button>
            <button class="btn btn-secondary" style="padding: 8px; font-size: 12px;" onclick="toggleAdmin('${u.email}', '${u.role}')">
              ${u.role === 'admin' ? '👤' : '👑'} Admin
            </button>
            <button class="btn btn-danger" style="padding: 8px; font-size: 12px;" onclick="deleteUser('${u.email}')">🗑️ Eliminar</button>
          </div>
        </div>
      `;
      usersList.appendChild(card);
    });
  }

  window.editUser = function(email) {
    const newName = prompt('Nuevo nombre:', '');
    if (newName) {
      DB.updateUser(email, { firstName: newName });
      renderUsers();
      showToast('✅ Usuario actualizado', 'success');
    }
  };

  window.toggleVerify = function(email, isVerified) {
    DB.updateUser(email, { verified: !isVerified });
    renderUsers();
    renderStats();
    showToast('✅ Estado actualizado', 'success');
  };

  window.toggleAdmin = function(email, role) {
    DB.updateUser(email, { role: role === 'admin' ? 'user' : 'admin' });
    renderUsers();
    showToast('✅ Rol actualizado', 'success');
  };

  window.deleteUser = function(email) {
    if (confirm(`¿Eliminar usuario ${email}?`)) {
      DB.deleteUser(email);
      renderUsers();
      renderStats();
      showToast('✅ Usuario eliminado', 'success');
    }
  };

  // Crear usuario
  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newUserName').value.trim();
    const last = document.getElementById('newUserLast').value.trim();
    const mail = document.getElementById('newUserEmail').value.trim();
    const phone = document.getElementById('newUserPhone').value.trim();

    if (!name || !last || !mail || !phone) {
      showToast('❌ Completa todos los campos', 'error');
      return;
    }

    if (DB.findUserByEmail(mail)) {
      showToast('❌ El correo ya existe', 'error');
      return;
    }

    const pass = 'Temp123';
    const hash = await DB.hashPassword(pass);
    await DB.saveUser({
      email: mail,
      firstName: name,
      lastName: last,
      phone,
      passHash: hash,
      role: 'user',
      verified: true
    });

    showToast(`✅ Usuario creado. Contraseña temporal: ${pass}`, 'success', 5000);
    e.target.reset();
    renderUsers();
    renderStats();
  });

  // ===== PRODUCTOS =====
  function renderProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    const products = DB.getProducts();

    if (products.length === 0) {
      productsList.innerHTML = '<div class="card" style="text-align: center; padding: 24px;">No hay productos</div>';
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '12px';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${p.title}</strong>
            <p style="color: var(--text-muted); font-size: 12px; margin: 4px 0;">DOP ${p.price.toLocaleString()} • Stock: ${p.stock} • ${p.category}</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="padding: 8px; font-size: 12px;" onclick="editProduct('${p.id}')">✏️</button>
            <button class="btn btn-danger" style="padding: 8px; font-size: 12px;" onclick="deleteProduct('${p.id}')">🗑️</button>
          </div>
        </div>
      `;
      productsList.appendChild(card);
    });
  }

  window.editProduct = function(id) {
    const p = DB.getProducts().find(x => x.id === id);
    const newStock = prompt('Nuevo stock:', p.stock);
    if (newStock !== null) {
      DB.updateProduct(id, { stock: parseInt(newStock) });
      renderProducts();
      renderStats();
      showToast('✅ Producto actualizado', 'success');
    }
  };

  window.deleteProduct = function(id) {
    if (confirm('¿Eliminar producto?')) {
      DB.deleteProduct(id);
      renderProducts();
      renderStats();
      showToast('✅ Producto eliminado', 'success');
    }
  };

  document.getElementById('createProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('prodTitle').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const stock = parseInt(document.getElementById('prodStock').value);
    const category = document.getElementById('prodCategory').value.trim();
    const image = document.getElementById('prodImage').value.trim();

    if (!title || !price || !stock) {
      showToast('❌ Completa los campos obligatorios', 'error');
      return;
    }

    DB.saveProduct({ title, price, stock, category, image });
    showToast('✅ Producto creado', 'success');
    e.target.reset();
    renderProducts();
    renderStats();
  });

  // ===== PATROCINIOS =====
  function renderSponsors() {
    const sponsorRequests = document.getElementById('sponsorRequests');
    sponsorRequests.innerHTML = '';
    const sponsors = DB.getSponsors().filter(s => s.status === 'pending');

    if (sponsors.length === 0) {
      sponsorRequests.innerHTML = '<div class="card" style="text-align: center; padding: 24px;">No hay solicitudes pendientes</div>';
      return;
    }

    sponsors.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '12px';
      card.innerHTML = `
        <div>
          <strong>${s.brand}</strong>
          <p style="color: var(--text-secondary); font-size: 12px; margin: 4px 0;">Rep: ${s.rep} | ${s.mail}</p>
          <p style="font-size: 13px; margin: 8px 0;"><strong>¿Por qué?</strong> ${s.why}</p>
          <p style="font-size: 13px; margin: 8px 0;"><strong>Ofrece:</strong> ${s.offer}</p>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button class="btn btn-success" style="padding: 8px;" onclick="approveSponsor('${s.id}')">✅ Aceptar</button>
            <button class="btn btn-danger" style="padding: 8px;" onclick="rejectSponsor('${s.id}')">❌ Rechazar</button>
          </div>
        </div>
      `;
      sponsorRequests.appendChild(card);
    });
  }

  window.approveSponsor = function(id) {
    DB.updateSponsor(id, { status: 'active' });
    renderSponsors();
    renderStats();
    showToast('✅ Patrocinador aceptado', 'success');
  };

  window.rejectSponsor = function(id) {
    DB.updateSponsor(id, { status: 'rejected' });
    renderSponsors();
    renderStats();
    showToast('❌ Solicitud rechazada', 'success');
  };

  // Inicializar
  renderStats();
  renderUsers();
  renderProducts();
  renderSponsors();

  // Auto-refresh cada 5s
  setInterval(() => {
    renderStats();
    renderUsers();
    renderProducts();
    renderSponsors();
  }, 5000);
})();
