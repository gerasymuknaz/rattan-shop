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

// ===== State initialization =====
let products = (window.INITIAL_PRODUCTS && window.INITIAL_PRODUCTS.length) ? window.INITIAL_PRODUCTS : defaultProducts;
let settings = (window.INITIAL_SETTINGS && Object.keys(window.INITIAL_SETTINGS).length) ? window.INITIAL_SETTINGS : defaultSettings;
let cart = [];

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

// ===== Render Products Function =====
function renderProducts(filter = 'all') {
    if (!productsGrid) return;
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    productsGrid.innerHTML = filtered.map((p, i) => `
        <div class="product-card" style="animation-delay: ${i * 0.05}s" data-category="${p.category}">
            <div class="product-image">
                ${p.image
                    ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="product-emoji" style="display:none">${p.emoji || '🪴'}</span>`
                    : `<span class="product-emoji">${p.emoji || '🪴'}</span>`
                }
                ${p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? 'Новинка' : p.badge === 'sale' ? 'Знижка' : 'Хіт'}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-size">${p.size || ''}</p>
                <div class="product-bottom">
                    <div class="product-price">
                        <span class="price-current">${p.price} грн</span>
                        ${p.oldPrice && p.oldPrice > p.price ? `<span class="price-old">${p.oldPrice} грн</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" data-id="${p.id}" title="Додати в кошик">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Bind add-to-cart buttons
    productsGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
}

// ===== Filter Buttons =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active')?.classList.remove('active');
        btn.classList.add('active');
        renderProducts(btn.dataset.filter);
    });
});

// ===== Cart Functions =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCart();
    showToast(`${product.name} додано в кошик!`);
    const btn = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
    if (btn) {
        btn.classList.add('added');
        btn.textContent = '✓';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.textContent = '+';
        }, 1200);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCart() {
    if (cartCount) cartCount.textContent = getCartCount();
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    if (cartFooter) cartFooter.style.display = 'block';
    if (cartTotal) cartTotal.textContent = `${getCartTotal()} грн`;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-thumb">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : (item.emoji || '🪴')}
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">${item.price * item.qty} грн</div>
                <div class="cart-item-qty">
                    <button onclick="changeQty(${item.id}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>
    `).join('');
}
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;

// ===== Cart Drawer Toggle =====
function openCart() {
    if (cartSidebar) cartSidebar.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// ===== Order Modal & Checkout =====
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        closeCart();
        setTimeout(() => {
            if (orderTotal) orderTotal.textContent = `${getCartTotal()} грн`;
            if (orderModal) orderModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }, 300);
    });
}

if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (orderModal) orderModal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (orderModal) {
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Order Form Submission (Sends to Flask SQLite API)
if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = orderForm.querySelectorAll('input, textarea');
        const orderData = {
            name: inputs[0] ? inputs[0].value : '',
            phone: inputs[1] ? inputs[1].value : '',
            city: inputs[2] ? inputs[2].value : '',
            warehouse: inputs[3] ? inputs[3].value : '',
            comment: inputs[4] ? inputs[4].value : '',
            total: getCartTotal(),
            items: cart.map(item => ({ name: item.name, quantity: item.qty, price: item.price }))
        };

        // Send order to Flask SQLite backend
        fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        }).catch(err => console.log('Offline order fallback:', err));

        if (orderModal) orderModal.classList.remove('active');
        document.body.style.overflow = '';
        cart = [];
        updateCart();
        showToast('✅ Замовлення оформлено! Ми зв\'яжемось з вами найближчим часом.');
        orderForm.reset();
    });
}

// ===== Contact Form (Sends to Flask SQLite API) =====
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = contactForm.querySelectorAll('input, textarea');
        const contactData = {
            name: inputs[0] ? inputs[0].value : '',
            phone: inputs[1] ? inputs[1].value : '',
            email: inputs[2] ? inputs[2].value : '',
            message: inputs[3] ? inputs[3].value : ''
        };

        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        }).catch(err => console.log('Contact send error:', err));

        showToast('✅ Повідомлення надіслано! Дякуємо!');
        contactForm.reset();
    });
}

// ===== Toast Notification =====
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ===== Mobile Menu =====
if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        if (nav.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
}

// ===== Scroll Header =====
if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50));
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - 72,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Admin Link =====
if (adminLoginLink) {
    adminLoginLink.addEventListener('click', (e) => {
        // Direct link to AdminLTE admin panel
        window.location.href = '/admin';
    });
}

// ===== Apply Settings Helper =====
function applySettings() {
    const s = settings;
    const phoneEl = document.getElementById('sitePhone');
    const emailEl = document.getElementById('siteEmail');
    const addressEl = document.getElementById('siteAddress');
    const hoursEl = document.getElementById('siteHours');

    if (phoneEl && s.phone) {
        phoneEl.textContent = s.phone;
        phoneEl.href = 'tel:' + s.phone.replace(/\s/g, '');
    }
    if (emailEl && s.email) {
        emailEl.textContent = s.email;
        emailEl.href = 'mailto:' + s.email;
    }
    if (addressEl && s.address) addressEl.textContent = s.address;
    if (hoursEl && s.hours) hoursEl.textContent = s.hours;

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && s.heroTitle1) {
        heroTitle.innerHTML = `${s.heroTitle1}<br><span>${s.heroTitle2 || ''}</span>`;
    }
    const heroDesc = document.querySelector('.hero-desc');
    if (heroDesc && s.heroDesc) heroDesc.textContent = s.heroDesc;

    const ctaPromo = document.querySelector('.cta p strong');
    if (ctaPromo && s.promo) ctaPromo.textContent = s.promo;

    const insta = document.getElementById('socialInsta');
    const tg = document.getElementById('socialTg');
    const fb = document.getElementById('socialFb');
    if (insta && s.insta) insta.href = s.insta;
    if (tg && s.tg) tg.href = s.tg;
    if (fb && s.fb) fb.href = s.fb;
}

// ===== Sync with Flask SQLite Backend if opened as a standalone static file =====
async function syncWithBackend() {
    try {
        const [prodRes, settRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/settings')
        ]);
        if (prodRes.ok) {
            const apiProds = await prodRes.json();
            if (Array.isArray(apiProds) && apiProds.length > 0) {
                products = apiProds;
                renderProducts();
            }
        }
        if (settRes.ok) {
            const apiSett = await settRes.json();
            if (apiSett && Object.keys(apiSett).length > 0) {
                settings = { ...settings, ...apiSett };
                applySettings();
            }
        }
    } catch (e) {
        // Offline or direct file
    }
}

// ===== Initial Execution =====
applySettings();
renderProducts();
syncWithBackend();
