// ===== Default Product Data =====
const defaultProducts = [
    { id: 1, name: "Кашпо «Класика»", size: "Ø 15 см, h 13 см", category: "small", price: 280, oldPrice: 0, badge: "", emoji: "🪴", image: "" },
    { id: 2, name: "Кашпо «Модерн»", size: "Ø 18 см, h 15 см", category: "small", price: 350, oldPrice: 0, badge: "new", emoji: "🌱", image: "" },
    { id: 3, name: "Кашпо «Бохо»", size: "Ø 22 см, h 20 см", category: "medium", price: 450, oldPrice: 580, badge: "sale", emoji: "🌾", image: "" },
    { id: 4, name: "Кашпо «Тропік»", size: "Ø 25 см, h 22 см", category: "medium", price: 520, oldPrice: 0, badge: "hit", emoji: "🌿", image: "" },
    { id: 5, name: "Кашпо «Гігант»", size: "Ø 35 см, h 30 см", category: "large", price: 780, oldPrice: 0, badge: "", emoji: "🌳", image: "" },
    { id: 6, name: "Кашпо «Підвісне»", size: "Ø 20 см, довж. 80 см", category: "medium", price: 590, oldPrice: 0, badge: "new", emoji: "🌻", image: "" },
    { id: 7, name: "Набір «Трійка»", size: "3 шт: Ø 12, 16, 20 см", category: "set", price: 750, oldPrice: 950, badge: "sale", emoji: "🪻", image: "" },
    { id: 8, name: "Кашпо «Квадрат»", size: "20×20 см, h 18 см", category: "medium", price: 420, oldPrice: 0, badge: "", emoji: "🌵", image: "" },
    { id: 9, name: "Кашпо «Великан»", size: "Ø 40 см, h 35 см", category: "large", price: 1050, oldPrice: 1350, badge: "sale", emoji: "🎋", image: "" },
    { id: 10, name: "Набір «П'ятірка»", size: "5 шт: Ø 10-24 см", category: "set", price: 1200, oldPrice: 1550, badge: "hit", emoji: "🎍", image: "" },
    { id: 11, name: "Кашпо «Малюк»", size: "Ø 10 см, h 9 см", category: "small", price: 180, oldPrice: 0, badge: "", emoji: "🌸", image: "" },
    { id: 12, name: "Кашпо «Конус»", size: "Ø 30 см, h 28 см", category: "large", price: 680, oldPrice: 0, badge: "new", emoji: "🎄", image: "" },
];

const defaultSettings = {
    phone: "+380 99 123 45 67",
    email: "info@polikashpo.ua",
    address: "м. Київ, вул. Хрещатик 10",
    hours: "Пн-Пт: 9:00-18:00, Сб: 10:00-15:00",
    heroTitle1: "Кашпо з поліротангу",
    heroTitle2: "красиво і практично",
    heroDesc: "Стильні кашпо з штучного ротангу — виглядають як натуральні, але служать у рази довше. Не бояться дощу, сонця і морозу.",
    promo: "ПОЛІ15",
    insta: "#",
    tg: "#",
    fb: "#"
};

// ===== Load data from localStorage =====
function loadProducts() {
    const saved = localStorage.getItem('pk_products');
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultProducts));
}

function saveProducts(products) {
    localStorage.setItem('pk_products', JSON.stringify(products));
}

function loadSettings() {
    const saved = localStorage.getItem('pk_settings');
    return saved ? JSON.parse(saved) : { ...defaultSettings };
}

function saveSettings(settings) {
    localStorage.setItem('pk_settings', JSON.stringify(settings));
}

// ===== State =====
let products = loadProducts();
let settings = loadSettings();
let cart = [];
let isAdmin = false;

// ===== DOM Elements =====
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderTotal = document.getElementById('orderTotal');
const orderForm = document.getElementById('orderForm');
const contactForm = document.getElementById('contactForm');
const toast = document.getElementById('toast');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('mainNav');
const header = document.getElementById('header');
const adminLoginLink = document.getElementById('adminLoginLink');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminLoginClose = document.getElementById('adminLoginClose');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminError = document.getElementById('adminError');
const adminPanel = document.getElementById('adminPanel');
const adminLogout = document.getElementById('adminLogout');

// ===== Apply Settings to Page =====
function applySettings() {
    const s = settings;
    const phoneEl = document.getElementById('sitePhone');
    const emailEl = document.getElementById('siteEmail');
    const addressEl = document.getElementById('siteAddress');
    const hoursEl = document.getElementById('siteHours');

    if (phoneEl) { phoneEl.textContent = s.phone; phoneEl.href = 'tel:' + s.phone.replace(/\s/g, ''); }
    if (emailEl) { emailEl.textContent = s.email; emailEl.href = 'mailto:' + s.email; }
    if (addressEl) addressEl.textContent = s.address;
    if (hoursEl) hoursEl.textContent = s.hours;

    // Hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.innerHTML = `${s.heroTitle1}<br><span>${s.heroTitle2}</span>`;
    const heroDesc = document.querySelector('.hero-desc');
    if (heroDesc) heroDesc.textContent = s.heroDesc;

    // Promo
    const ctaSection = document.querySelector('.cta p strong');
    if (ctaSection) ctaSection.textContent = s.promo;

    // Social
    const insta = document.getElementById('socialInsta');
    const tg = document.getElementById('socialTg');
    const fb = document.getElementById('socialFb');
    if (insta) insta.href = s.insta || '#';
    if (tg) tg.href = s.tg || '#';
    if (fb) fb.href = s.fb || '#';
}

// ===== Render Products =====
function renderProducts(filter = 'all') {
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    productsGrid.innerHTML = filtered.map((p, i) => `
        <div class="product-card" style="animation-delay: ${i * 0.08}s" data-category="${p.category}">
            <div class="product-image">
                ${p.image
            ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="product-emoji" style="display:none">${p.emoji}</span>`
            : `<span class="product-emoji">${p.emoji}</span>`
        }
                ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? 'Новинка' : p.badge === 'sale' ? 'Знижка' : 'Хіт'
            }</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-size">${p.size}</p>
                <div class="product-bottom">
                    <div class="product-price">
                        <span class="price-current">${p.price} грн</span>
                        ${p.oldPrice ? `<span class="price-old">${p.oldPrice} грн</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-id="${p.id}" title="Додати в кошик">+</button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
}

// ===== Filter Buttons =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.dataset.filter);
    });
});

// ===== Cart Functions =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) { existing.qty++; } else { cart.push({ ...product, qty: 1 }); }
    updateCart();
    showToast(`${product.name} додано в кошик!`);
    const btn = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
    if (btn) {
        btn.classList.add('added'); btn.textContent = '✓';
        setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 1200);
    }
}

function removeFromCart(productId) { cart = cart.filter(item => item.id !== productId); updateCart(); }

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(productId); return; }
    updateCart();
}
// Make accessible globally for onclick handlers
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;

function getCartTotal() { return cart.reduce((sum, item) => sum + item.price * item.qty, 0); }

function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('visible', totalItems > 0);
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : item.emoji}
                </div>
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${item.price} грн</p>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        `).join('');
        cartFooter.style.display = 'block';
        cartTotal.textContent = `${getCartTotal()} грн`;
    }
}

// ===== Cart Sidebar Toggle =====
function openCart() { cartOverlay.classList.add('active'); cartSidebar.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeCart() { cartOverlay.classList.remove('active'); cartSidebar.classList.remove('active'); document.body.style.overflow = ''; }
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== Order Modal =====
checkoutBtn.addEventListener('click', () => {
    closeCart();
    setTimeout(() => { orderTotal.textContent = `${getCartTotal()} грн`; orderModal.classList.add('active'); document.body.style.overflow = 'hidden'; }, 300);
});
modalClose.addEventListener('click', () => { orderModal.classList.remove('active'); document.body.style.overflow = ''; });
orderModal.addEventListener('click', (e) => { if (e.target === orderModal) { orderModal.classList.remove('active'); document.body.style.overflow = ''; } });
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderModal.classList.remove('active'); document.body.style.overflow = '';
    cart = []; updateCart();
    showToast('✅ Замовлення оформлено! Ми зв\'яжемось з вами найближчим часом.');
    orderForm.reset();
});

// ===== Contact Form =====
contactForm.addEventListener('submit', (e) => { e.preventDefault(); showToast('✅ Повідомлення надіслано! Дякуємо!'); contactForm.reset(); });

// ===== Toast =====
function showToast(message) {
    toast.textContent = message; toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ===== Mobile Menu =====
mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
    const spans = mobileMenuBtn.querySelectorAll('span');
    if (nav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = ''; spans[1].style.opacity = ''; spans[2].style.transform = '';
    }
});
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = ''; spans[1].style.opacity = ''; spans[2].style.transform = '';
    });
});

// ===== Scroll Header =====
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) { window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 72, behavior: 'smooth' }); }
    });
});

// ============================
// ===== ADMIN PANEL =====
// ============================

// Admin credentials (hashed for basic obfuscation)
const ADMIN_USER = 'nzrka';
const ADMIN_PASS = '20112009Gg';

// Open admin login modal
adminLoginLink.addEventListener('click', () => {
    adminLoginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    adminError.textContent = '';
});

adminLoginClose.addEventListener('click', () => {
    adminLoginModal.classList.remove('active');
    document.body.style.overflow = '';
});

adminLoginModal.addEventListener('click', (e) => {
    if (e.target === adminLoginModal) { adminLoginModal.classList.remove('active'); document.body.style.overflow = ''; }
});

// Login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        isAdmin = true;
        adminLoginModal.classList.remove('active');
        openAdminPanel();
        showToast('✅ Ви увійшли в адмін панель');
        adminLoginForm.reset();
        adminError.textContent = '';
    } else {
        adminError.textContent = '❌ Невірний логін або пароль';
    }
});

// Logout
adminLogout.addEventListener('click', () => {
    isAdmin = false;
    adminPanel.classList.remove('active');
    document.body.style.overflow = '';
    showToast('Ви вийшли з адмін панелі');
});

// Open admin panel
function openAdminPanel() {
    adminPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
    populateAdminFields();
    renderAdminProducts();
}

// Populate admin fields from settings
function populateAdminFields() {
    document.getElementById('adminPhone').value = settings.phone;
    document.getElementById('adminEmail').value = settings.email;
    document.getElementById('adminAddress').value = settings.address;
    document.getElementById('adminHours').value = settings.hours;
    document.getElementById('adminHeroTitle1').value = settings.heroTitle1;
    document.getElementById('adminHeroTitle2').value = settings.heroTitle2;
    document.getElementById('adminHeroDesc').value = settings.heroDesc;
    document.getElementById('adminPromo').value = settings.promo;
    document.getElementById('adminInsta').value = settings.insta;
    document.getElementById('adminTg').value = settings.tg;
    document.getElementById('adminFb').value = settings.fb;
}

// Admin tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
});

// Save contacts
document.getElementById('saveContacts').addEventListener('click', () => {
    settings.phone = document.getElementById('adminPhone').value;
    settings.email = document.getElementById('adminEmail').value;
    settings.address = document.getElementById('adminAddress').value;
    settings.hours = document.getElementById('adminHours').value;
    saveSettings(settings);
    applySettings();
    showToast('✅ Контакти збережено!');
});

// Save hero
document.getElementById('saveHero').addEventListener('click', () => {
    settings.heroTitle1 = document.getElementById('adminHeroTitle1').value;
    settings.heroTitle2 = document.getElementById('adminHeroTitle2').value;
    settings.heroDesc = document.getElementById('adminHeroDesc').value;
    settings.promo = document.getElementById('adminPromo').value;
    saveSettings(settings);
    applySettings();
    showToast('✅ Головну сторінку збережено!');
});

// Save social
document.getElementById('saveSocial').addEventListener('click', () => {
    settings.insta = document.getElementById('adminInsta').value;
    settings.tg = document.getElementById('adminTg').value;
    settings.fb = document.getElementById('adminFb').value;
    saveSettings(settings);
    applySettings();
    showToast('✅ Соцмережі збережено!');
});

// ===== Admin Products =====
function renderAdminProducts() {
    const list = document.getElementById('adminProductsList');
    list.innerHTML = products.map(p => `
        <div class="admin-product-item" onclick="openProductEdit(${p.id})">
            <div class="admin-product-thumb">
                ${p.image ? `<img src="${p.image}" alt="${p.name}">` : p.emoji}
            </div>
            <div class="admin-product-meta">
                <strong>${p.name}</strong>
                <span>${p.size} — ${p.price} грн</span>
            </div>
        </div>
    `).join('');
}

function openProductEdit(productId) {
    const p = products.find(pr => pr.id === productId);
    if (!p) return;
    document.getElementById('editProductId').value = p.id;
    document.getElementById('editProductName').value = p.name;
    document.getElementById('editProductSize').value = p.size;
    document.getElementById('editProductPrice').value = p.price;
    document.getElementById('editProductOldPrice').value = p.oldPrice || 0;
    document.getElementById('editProductImage').value = p.image || '';
    document.getElementById('editProductEmoji').value = p.emoji;
    document.getElementById('editProductCategory').value = p.category;
    document.getElementById('editProductBadge').value = p.badge || '';
    document.getElementById('adminProductEdit').style.display = 'flex';
}
window.openProductEdit = openProductEdit;

document.getElementById('cancelEditProduct').addEventListener('click', () => {
    document.getElementById('adminProductEdit').style.display = 'none';
});

document.getElementById('saveProduct').addEventListener('click', () => {
    const id = parseInt(document.getElementById('editProductId').value);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    products[idx].name = document.getElementById('editProductName').value;
    products[idx].size = document.getElementById('editProductSize').value;
    products[idx].price = parseInt(document.getElementById('editProductPrice').value) || 0;
    products[idx].oldPrice = parseInt(document.getElementById('editProductOldPrice').value) || 0;
    products[idx].image = document.getElementById('editProductImage').value;
    products[idx].emoji = document.getElementById('editProductEmoji').value;
    products[idx].category = document.getElementById('editProductCategory').value;
    products[idx].badge = document.getElementById('editProductBadge').value;

    saveProducts(products);
    renderProducts();
    renderAdminProducts();
    document.getElementById('adminProductEdit').style.display = 'none';
    showToast('✅ Товар збережено!');
});

// ===== Init =====
applySettings();
renderProducts();
