/* database.js — Sistema de almacenamiento en LocalStorage */

const STORAGE_KEY = 'zyrix_db_v2';

const defaultDB = {
  users: [],
  products: [],
  sponsors: [],
  orders: [],
  nextOrderNum: 1
};

/* Hash de contraseña seguro */
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Lectura de BD */
function readDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultDB));
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB:', e);
    return JSON.parse(JSON.stringify(defaultDB));
  }
}

/* Escritura de BD */
function writeDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* Generar código de verificación */
function generateVerifyCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const a = letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length)) + letters.charAt(Math.floor(Math.random() * letters.length));
  const b = Math.floor(100 + Math.random() * 900);
  return `${a}-${b}`;
}

/* Inicializar BD con admin preconfigurado */
async function init() {
  const db = readDB();
  
  // Crear admin si no existe
  const adminEmail = 'sebastian';
  const adminExists = db.users.find(u => u.email === adminEmail);
  if (!adminExists) {
    const passHash = await hashPassword('colestre11');
    const admin = {
      id: 'u' + Date.now(),
      email: adminEmail,
      firstName: 'Sebastian',
      lastName: 'Admin',
      phone: '000-000',
      passHash,
      role: 'admin',
      verified: true,
      verifyCode: null,
      orders: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(admin);
    writeDB(db);
  }
  
  return db;
}

/* API de base de datos */
const DB = {
  init,
  hashPassword,
  generateVerifyCode,

  // ===== Users =====
  getUsers() {
    return readDB().users.slice();
  },

  findUserByEmail(email) {
    return readDB().users.find(u => u.email === email);
  },

  async saveUser(userData) {
    const db = readDB();
    const newUser = {
      id: userData.id || 'u' + Date.now(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      passHash: userData.passHash,
      role: userData.role || 'user',
      verified: userData.verified || false,
      verifyCode: userData.verifyCode || null,
      orders: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },

  updateUser(email, patch) {
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return null;
    Object.assign(user, patch);
    writeDB(db);
    return user;
  },

  deleteUser(email) {
    const db = readDB();
    db.users = db.users.filter(u => u.email !== email);
    writeDB(db);
  },

  // ===== Products =====
  getProducts() {
    return readDB().products.slice();
  },

  saveProduct(productData) {
    const db = readDB();
    const newProduct = {
      id: productData.id || 'p' + Date.now(),
      title: productData.title,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      category: productData.category || '',
      image: productData.image || '',
      featured: productData.featured || false,
      createdAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    writeDB(db);
    return newProduct;
  },

  updateProduct(id, patch) {
    const db = readDB();
    const product = db.products.find(p => p.id === id);
    if (!product) return null;
    Object.assign(product, patch);
    writeDB(db);
    return product;
  },

  deleteProduct(id) {
    const db = readDB();
    db.products = db.products.filter(p => p.id !== id);
    writeDB(db);
  },

  // ===== Sponsors =====
  getSponsors() {
    return readDB().sponsors.slice();
  },

  saveSponsor(sponsorData) {
    const db = readDB();
    const newSponsor = {
      id: sponsorData.id || 'sp' + Date.now(),
      rep: sponsorData.rep,
      mail: sponsorData.mail,
      brand: sponsorData.brand,
      why: sponsorData.why,
      offer: sponsorData.offer,
      expect: sponsorData.expect,
      status: sponsorData.status || 'pending',
      createdAt: new Date().toISOString()
    };
    db.sponsors.push(newSponsor);
    writeDB(db);
    return newSponsor;
  },

  updateSponsor(id, patch) {
    const db = readDB();
    const sponsor = db.sponsors.find(s => s.id === id);
    if (!sponsor) return null;
    Object.assign(sponsor, patch);
    writeDB(db);
    return sponsor;
  },

  // ===== Orders =====
  getOrders() {
    return readDB().orders.slice();
  },

  saveOrder(orderData) {
    const db = readDB();
    const orderNum = (db.nextOrderNum || 1);
    db.nextOrderNum = orderNum + 1;
    const newOrder = {
      id: 'o' + Date.now(),
      orderNumber: `ZRX-2026-${String(orderNum).padStart(4, '0')}`,
      userEmail: orderData.userEmail,
      items: orderData.items,
      total: orderData.total,
      currency: 'DOP',
      createdAt: new Date().toISOString()
    };
    db.orders.push(newOrder);
    writeDB(db);
    return newOrder;
  },

  // ===== Stats =====
  getStats() {
    const db = readDB();
    return {
      totalUsers: db.users.length,
      verifiedUsers: db.users.filter(u => u.verified).length,
      totalOrders: db.orders.length,
      totalRevenue: db.orders.reduce((sum, o) => sum + (o.total || 0), 0),
      totalProducts: db.products.length,
      activeProducts: db.products.filter(p => p.stock > 0).length,
      activesponsors: db.sponsors.filter(s => s.status === 'active').length,
      pendingSponsors: db.sponsors.filter(s => s.status === 'pending').length
    };
  }
};

export default DB;
