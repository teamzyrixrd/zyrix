/* store-page.js */
import DB from './database.js';
import { setupNavbar, setupAccountDropdown, showToast, getCurrentUser } from './shared.js';

(async function() {
  await DB.init();
  setupNavbar();
  setupAccountDropdown();

  const productsContainer = document.getElementById('productsContainer');
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  let cart = loadCart();

  // Cargar carrito desde localStorage
  function loadCart() {
    const user = getCurrentUser();
    const key = user ? `zyrix_cart_${user.email}` : 'zyrix_cart_guest';
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  // Guardar carrito
  function saveCart() {
    const user = getCurrentUser();
    const key = user ? `zyrix_cart_${user.email}` : 'zyrix_cart_guest';
    localStorage.setItem(key, JSON.stringify(cart));
  }

  // Renderizar productos
  function renderProducts() {
    const products = DB.getProducts();
    
    if (products.length === 0) {
      // Crear productos demo si no existen
      const demoProducts = [
        { title: 'Pack Zyrix — Camiseta Premium', price: 800, stock: 15, category: 'merch' },
        { title: 'Botella Técnica Zyrix', price: 450, stock: 20, category: 'merch' },
        { title: 'Licencia Software Aerodinámico', price: 4500, stock: 3, category: 'software' },
        { title: 'Módulo de Control Embebido', price: 2800, stock: 5, category: 'hardware' },
        { title: 'Cable Especial OBD-II', price: 320, stock: 30, category: 'accesorios' }
      ];
      demoProducts.forEach(p => DB.saveProduct(p));
    }

    productsContainer.innerHTML = '';
    DB.getProducts().forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 12px; text-align: center;">📦</div>
        <h3>${p.title}</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 12px;">${p.category || 'Producto'}</p>
        <div class="card-footer">
          <div>
            <div class="card-price">DOP ${p.price.toLocaleString()}</div>
            <div class="card-stock">Stock: ${p.stock}</div>
          </div>
          <button class="btn btn-secondary" onclick="addToCart('${p.id}')" ${p.stock <= 0 ? 'disabled' : ''}>
            ${p.stock <= 0 ? 'Sin Stock' : '🛒'}
          </button>
        </div>
      `;
      productsContainer.appendChild(card);
    });
  }

  // Agregar al carrito
  window.addToCart = function(productId) {
    const p = DB.getProducts().find(x => x.id === productId);
    if (!p || p.stock <= 0) {
      showToast('❌ Este producto no tiene stock', 'error');
      return;
    }

    if (!cart[productId]) {
      cart[productId] = { qty: 0, price: p.price, title: p.title };
    }

    if (cart[productId].qty >= p.stock) {
      showToast('❌ Stock insuficiente', 'error');
      return;
    }

    cart[productId].qty++;
    saveCart();
    renderCart();
    showToast(`✅ ${p.title} agregado`, 'success', 1500);
  };

  // Render carrito
  function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    for (const pid in cart) {
      const item = cart[pid];
      itemCount += item.qty;
      total += item.qty * item.price;

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <div class="cart-item-price">DOP ${item.price}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-ghost" onclick="modifyCart('${pid}', -1)" style="padding: 6px 10px; font-size: 12px;">−</button>
          <span style="min-width: 30px; text-align: center;">${item.qty}</span>
          <button class="btn btn-ghost" onclick="modifyCart('${pid}', 1)" style="padding: 6px 10px; font-size: 12px;">+</button>
          <button class="btn btn-danger" onclick="removeFromCart('${pid}')" style="padding: 6px 8px; font-size: 10px;">✕</button>
        </div>
      `;
      cartItems.appendChild(row);
    }

    cartCount.textContent = itemCount;
    cartTotal.textContent = `DOP ${total.toLocaleString()}`;
  }

  // Modificar cantidad
  window.modifyCart = function(productId, delta) {
    if (cart[productId]) {
      const p = DB.getProducts().find(x => x.id === productId);
      cart[productId].qty += delta;
      if (cart[productId].qty <= 0) {
        delete cart[productId];
      } else if (cart[productId].qty > p.stock) {
        cart[productId].qty = p.stock;
        showToast('❌ Stock insuficiente', 'error');
      }
      saveCart();
      renderCart();
    }
  };

  // Remover del carrito
  window.removeFromCart = function(productId) {
    delete cart[productId];
    saveCart();
    renderCart();
    showToast('🗑️ Removido del carrito', 'info', 1500);
  };

  // Checkout
  checkoutBtn.addEventListener('click', async () => {
    const user = getCurrentUser();

    if (!user) {
      showToast('❌ Debes iniciar sesión primero', 'error');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    const dbUser = DB.findUserByEmail(user.email);
    if (!dbUser.verified) {
      showToast('⏳ Tu cuenta no está verificada', 'error');
      return;
    }

    if (Object.keys(cart).length === 0) {
      showToast('🛒 El carrito está vacío', 'error');
      return;
    }

    // Validar stock y crear orden
    let items = [];
    let total = 0;
    let valid = true;

    for (const pid in cart) {
      const p = DB.getProducts().find(x => x.id === pid);
      if (!p) {
        showToast('❌ Producto no encontrado', 'error');
        valid = false;
        break;
      }
      if (cart[pid].qty > p.stock) {
        showToast(`❌ Stock insuficiente para ${p.title}`, 'error');
        valid = false;
        break;
      }
      items.push({ id: pid, title: p.title, price: p.price, qty: cart[pid].qty });
      total += cart[pid].qty * p.price;
      // Actualizar stock
      DB.updateProduct(pid, { stock: p.stock - cart[pid].qty });
    }

    if (!valid) return;

    // Crear orden
    const order = await DB.saveOrder({ userEmail: user.email, items, total });

    // Guardar en perfil del usuario
    dbUser.orders = dbUser.orders || [];
    dbUser.orders.push(order);
    DB.updateUser(user.email, { orders: dbUser.orders });

    // Génerar PDF
    try {
      const { jsPDF } = window.jspdf;
      if (jsPDF) {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Comprobante de Compra', 14, 20);
        doc.setFontSize(11);
        doc.text(`Orden: ${order.orderNumber}`, 14, 30);
        doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}`, 14, 36);
        let y = 46;
        items.forEach(it => {
          doc.text(`${it.qty}x ${it.title} — DOP ${(it.price * it.qty).toLocaleString()}`, 14, y);
          y += 6;
        });
        doc.text(`TOTAL: DOP ${total.toLocaleString()}`, 14, y + 6);
        doc.save(`Zyrix-${order.orderNumber}.pdf`);
      }
    } catch (e) {
      console.warn('jsPDF no disponible');
    }

    // Limpiar carrito
    cart = {};
    saveCart();
    renderCart();
    renderProducts();

    showToast(`✅ Compra realizada. Orden: ${order.orderNumber}`, 'success');
    setTimeout(() => window.location.href = 'cuenta.html', 2000);
  });

  // Inicializar
  renderProducts();
  renderCart();
})();
