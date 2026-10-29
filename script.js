// ===== Product Data =====
const products = [
    {
        id: 1, name: "Кашпо «Класика»", size: "Ø 15 см, h 13 см", category: "small",
        price: 320, oldPrice: null, badge: null, emoji: "🪴"
    },
    {
        id: 2, name: "Кашпо «Мінімал»", size: "Ø 18 см, h 15 см", category: "small",
        price: 390, oldPrice: null, badge: "new", emoji: "🌱"
    },
    {
        id: 3, name: "Кашпо «Бохо»", size: "Ø 22 см, h 20 см", category: "medium",
        price: 520, oldPrice: 650, badge: "sale", emoji: "🌾"
    },
    {
        id: 4, name: "Кашпо «Тропік»", size: "Ø 25 см, h 22 см", category: "medium",
        price: 580, oldPrice: null, badge: "hit", emoji: "🌿"
    },
    {
        id: 5, name: "Кашпо «Гігант»", size: "Ø 35 см, h 30 см", category: "large",
        price: 890, oldPrice: null, badge: null, emoji: "🌳"
    },
    {
        id: 6, name: "Кашпо «Підвісне»", size: "Ø 20 см, довж. 80 см", category: "medium",
        price: 650, oldPrice: null, badge: "new", emoji: "🌻"
    },
    {
        id: 7, name: "Набір «Трійка»", size: "3 шт: Ø 12, 16, 20 см", category: "set",
        price: 850, oldPrice: 1050, badge: "sale", emoji: "🪻"
    },
    {
        id: 8, name: "Кашпо «Квадрат»", size: "20×20 см, h 18 см", category: "medium",
        price: 480, oldPrice: null, badge: null, emoji: "🌵"
    },
    {
        id: 9, name: "Кашпо «Великан»", size: "Ø 40 см, h 35 см", category: "large",
        price: 1200, oldPrice: 1500, badge: "sale", emoji: "🎋"
    },
    {
        id: 10, name: "Набір «П'ятірка»", size: "5 шт: Ø 10-24 см", category: "set",
        price: 1350, oldPrice: 1700, badge: "hit", emoji: "🎍"
    },
    {
        id: 11, name: "Кашпо «Малюк»", size: "Ø 10 см, h 9 см", category: "small",
        price: 220, oldPrice: null, badge: null, emoji: "🌸"
    },
    {
        id: 12, name: "Кашпо «Конус»", size: "Ø 30 см, h 28 см", category: "large",
        price: 780, oldPrice: null, badge: "new", emoji: "🎄"
    },
];

// ===== State =====
let cart = [];
let activeFilter = 'all';

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
const nav = document.querySelector('.nav');
const header = document.getElementById('header');

// ===== Render Products =====
function renderProducts(filter = 'all') {
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    productsGrid.innerHTML = filtered.map((p, i) => `
        <div class="product-card" style="animation-delay: ${i * 0.08}s" data-category="${p.category}">
            <div class="product-image">
                <span class="product-emoji">${p.emoji}</span>
                ${p.badge ? `<span class="product-badge badge-${p.badge}">${
                    p.badge === 'new' ? 'Новинка' : p.badge === 'sale' ? 'Знижка' : 'Хіт'
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

    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
}

// ===== Filter Buttons =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderProducts(activeFilter);
    });
});

// ===== Cart Functions =====
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCart();
    showToast(`${product.name} додано в кошик!`);

    // Animate button
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
        return;
    }
    updateCart();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

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
                <div class="cart-item-img">${item.emoji}</div>
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
function openCart() {
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== Order Modal =====
checkoutBtn.addEventListener('click', () => {
    closeCart();
    setTimeout(() => {
        orderTotal.textContent = `${getCartTotal()} грн`;
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 300);
});

modalClose.addEventListener('click', () => {
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
});

orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
    cart = [];
    updateCart();
    showToast('✅ Замовлення оформлено! Ми зв\'яжемось з вами найближчим часом.');
    orderForm.reset();
});

// ===== Contact Form =====
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ Повідомлення надіслано! Дякуємо!');
    contactForm.reset();
});

// ===== Toast =====
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
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
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile menu when clicking a link
nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ===== Scroll Header =====
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Smooth Scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            const offset = 72;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ===== Init =====
renderProducts();

