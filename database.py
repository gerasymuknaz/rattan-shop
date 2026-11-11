import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rattan_shop.db')

DEFAULT_CATEGORIES = [
    {"slug": "small", "name": "Маленькі кашпо", "sort_order": 1},
    {"slug": "medium", "name": "Середні кашпо", "sort_order": 2},
    {"slug": "large", "name": "Великі кашпо", "sort_order": 3},
    {"slug": "set", "name": "Набори кашпо", "sort_order": 4}
]

DEFAULT_PRODUCTS = [
    {
        "name": "Кашпо «Класика»",
        "size": "Ø 15 см, h 13 см",
        "description": "Класичне кашпо ручного плетіння з поліротангу. Ідеально підходить для кімнатних рослин та невеликих квітів.",
        "category": "small",
        "price": 280,
        "old_price": 0,
        "badge": "",
        "emoji": "🪴",
        "image": ""
    },
    {
        "name": "Кашпо «Модерн»",
        "size": "Ø 18 см, h 15 см",
        "description": "Сучасний дизайн та акуратне плетіння. Стійке до вологи та ультрафіолету.",
        "category": "small",
        "price": 350,
        "old_price": 0,
        "badge": "new",
        "emoji": "🌱",
        "image": ""
    },
    {
        "name": "Кашпо «Бохо»",
        "size": "Ø 22 см, h 20 см",
        "description": "Стильне кашпо в стилі бохо. Прекрасно доповнить терасу чи вітальню.",
        "category": "medium",
        "price": 450,
        "old_price": 580,
        "badge": "sale",
        "emoji": "🌾",
        "image": ""
    },
    {
        "name": "Кашпо «Тропік»",
        "size": "Ø 25 см, h 22 см",
        "description": "Містке кашпо для пишних рослин. Міцний полімерний каркас.",
        "category": "medium",
        "price": 520,
        "old_price": 0,
        "badge": "hit",
        "emoji": "🌿",
        "image": ""
    },
    {
        "name": "Кашпо «Гігант»",
        "size": "Ø 35 см, h 30 см",
        "description": "Велике кашпо для туй, пальм та вуличних композицій. Морозостійке.",
        "category": "large",
        "price": 780,
        "old_price": 0,
        "badge": "",
        "emoji": "🌳",
        "image": ""
    },
    {
        "name": "Кашпо «Підвісне»",
        "size": "Ø 20 см, довж. 80 см",
        "description": "Підвісне кашпо для ампельних рослин та петуній з надійним кріпленням.",
        "category": "medium",
        "price": 590,
        "old_price": 0,
        "badge": "new",
        "emoji": "🌻",
        "image": ""
    },
    {
        "name": "Набір «Трійка»",
        "size": "3 шт: Ø 12, 16, 20 см",
        "description": "Комплект з трьох кашпо різного розміру в єдиному кольоровому рішенні.",
        "category": "set",
        "price": 750,
        "old_price": 950,
        "badge": "sale",
        "emoji": "🪻",
        "image": ""
    },
    {
        "name": "Кашпо «Квадрат»",
        "size": "20×20 см, h 18 см",
        "description": "Сувора геометрична форма. Чудово підходить для сучасних інтер'єрів та балконів.",
        "category": "medium",
        "price": 420,
        "old_price": 0,
        "badge": "",
        "emoji": "🌵",
        "image": ""
    },
    {
        "name": "Кашпо «Великан»",
        "size": "Ø 40 см, h 35 см",
        "description": "Масивне та стійке кашпо великого об'єму. Не деформується на сонці.",
        "category": "large",
        "price": 1050,
        "old_price": 1350,
        "badge": "sale",
        "emoji": "🎋",
        "image": ""
    },
    {
        "name": "Набір «П'ятірка»",
        "size": "5 шт: Ø 10-24 см",
        "description": "Вигідний набір з 5 кашпо для повного озеленення будинку чи тераси.",
        "category": "set",
        "price": 1200,
        "old_price": 1550,
        "badge": "hit",
        "emoji": "🎍",
        "image": ""
    },
    {
        "name": "Кашпо «Малюк»",
        "size": "Ø 10 см, h 9 см",
        "description": "Мініатюрне кашпо для сукулентів, кактусів або фіалок.",
        "category": "small",
        "price": 180,
        "old_price": 0,
        "badge": "",
        "emoji": "🌸",
        "image": ""
    },
    {
        "name": "Кашпо «Конус»",
        "size": "Ø 30 см, h 28 см",
        "description": "Елегантна конусна форма. Підкреслює стрункість рослин.",
        "category": "large",
        "price": 680,
        "old_price": 0,
        "badge": "new",
        "emoji": "🎄",
        "image": ""
    }
]

DEFAULT_SETTINGS = {
    "site_name": "ПоліКашпо",
    "phone": "+380 99 123 45 67",
    "email": "info@polikashpo.ua",
    "address": "м. Київ, вул. Хрещатик 10",
    "hours": "Пн-Пт: 9:00-18:00, Сб: 10:00-15:00",
    "hero_title1": "Кашпо з поліротангу",
    "hero_title2": "красиво і практично",
    "hero_desc": "Стильні кашпо з штучного ротангу — виглядають як натуральні, але служать у рази довше. Не бояться дощу, сонця і морозу.",
    "promo": "ПОЛІ15",
    "insta": "https://instagram.com",
    "tg": "https://t.me",
    "fb": "https://facebook.com"
}

DEFAULT_REVIEWS = [
    {
        "author_name": "Олена Коваленко",
        "city_info": "м. Львів • тераса",
        "date_str": "Жовтень 2026",
        "stars": 5,
        "text": "Стоять на терасі вже 2 роки — виглядають як нові! Ніякого вигоряння, ніякого пошкодження від дощу. Супер якість!"
    },
    {
        "author_name": "Андрій Мельник",
        "city_info": "м. Київ • сад",
        "date_str": "Вересень 2026",
        "stars": 5,
        "text": "Думав що пластик буде виглядати дешево — помилявся! Виглядає як справжній ротанг, а за якістю навіть краще. Раджу!"
    },
    {
        "author_name": "Марія Шевченко",
        "city_info": "м. Одеса • балкон",
        "date_str": "Серпень 2026",
        "stars": 5,
        "text": "Купила набір з 5 кашпо для квітів у дворі. Пережили зиму без проблем! Мию просто шлангом — і вони чисті."
    }
]


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Categories table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0
        )
    """)

    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            size TEXT,
            description TEXT,
            category TEXT DEFAULT 'medium',
            price INTEGER NOT NULL DEFAULT 0,
            old_price INTEGER DEFAULT 0,
            badge TEXT DEFAULT '',
            emoji TEXT DEFAULT '🪴',
            image TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            phone TEXT,
            city TEXT,
            warehouse TEXT,
            payment_method TEXT,
            items_json TEXT,
            total_price INTEGER DEFAULT 0,
            status TEXT DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Messages (Feedback / Contact form) table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            message TEXT,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Reviews table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_name TEXT NOT NULL,
            city_info TEXT,
            date_str TEXT,
            stars INTEGER DEFAULT 5,
            text TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Seed Admin Users if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        admin_pass = generate_password_hash("admin123")
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", ("admin", admin_pass))
        conn.commit()

    cursor.execute("SELECT id FROM users WHERE username = 'nzrka'")
    if not cursor.fetchone():
        nzrka_pass = generate_password_hash("20112009Gg")
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", ("nzrka", nzrka_pass))
        conn.commit()

    # Seed Categories if empty
    cursor.execute("SELECT COUNT(*) as count FROM categories")
    if cursor.fetchone()["count"] == 0:
        for cat in DEFAULT_CATEGORIES:
            cursor.execute("""
                INSERT OR IGNORE INTO categories (slug, name, sort_order)
                VALUES (?, ?, ?)
            """, (cat["slug"], cat["name"], cat["sort_order"]))
        conn.commit()

    # Seed Default Products if empty
    cursor.execute("SELECT COUNT(*) as count FROM products")
    if cursor.fetchone()["count"] == 0:
        for p in DEFAULT_PRODUCTS:
            cursor.execute("""
                INSERT INTO products (name, size, description, category, price, old_price, badge, emoji, image, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (p["name"], p["size"], p["description"], p["category"], p["price"], p["old_price"], p["badge"], p["emoji"], p["image"]))
        conn.commit()

    # Seed Default Settings if empty
    cursor.execute("SELECT COUNT(*) as count FROM settings")
    if cursor.fetchone()["count"] == 0:
        for k, v in DEFAULT_SETTINGS.items():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))
        conn.commit()

    # Seed Default Reviews if empty
    cursor.execute("SELECT COUNT(*) as count FROM reviews")
    if cursor.fetchone()["count"] == 0:
        for r in DEFAULT_REVIEWS:
            cursor.execute("""
                INSERT INTO reviews (author_name, city_info, date_str, stars, text, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (r["author_name"], r["city_info"], r["date_str"], r["stars"], r["text"]))
        conn.commit()

    conn.close()


if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)
