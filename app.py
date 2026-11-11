import os
import uuid
import json
import sqlite3
from functools import wraps
from flask import (
    Flask, render_template, request, redirect, url_for, flash, session,
    jsonify, send_from_directory
)
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from database import get_db, init_db

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'polikashpo-secret-key-2026-adminlte')

# Configuration for image uploads
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image_file(file):
    if file and file.filename and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        base = secure_filename(file.filename.rsplit('.', 1)[0])
        unique_name = f"{uuid.uuid4().hex[:10]}_{base}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
        file.save(filepath)
        return f"/static/uploads/{unique_name}"
    return None


def get_all_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    return {row['key']: (row['value'] or '') for row in rows}


def get_categories_list():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
    cats = cursor.fetchall()
    conn.close()
    return cats


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            flash('Будь ласка, увійдіть для доступу до адмін-панелі.', 'warning')
            return redirect(url_for('admin_login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


@app.context_processor
def inject_admin_globals():
    if session.get('admin_logged_in'):
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM orders WHERE status = 'new'")
            new_orders = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(*) as count FROM messages WHERE is_read = 0")
            unread_msgs = cursor.fetchone()['count']
            conn.close()
            return {
                'new_orders_count': new_orders,
                'unread_messages_count': unread_msgs
            }
        except Exception:
            return {'new_orders_count': 0, 'unread_messages_count': 0}
    return {'new_orders_count': 0, 'unread_messages_count': 0}


# ==========================================
# PUBLIC FRONTEND & API ROUTES
# ==========================================

@app.route('/')
def shop_index():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, size, description, category, price, old_price, badge, emoji, image, is_active
        FROM products 
        WHERE is_active = 1 
        ORDER BY id ASC
    """)
    db_products = cursor.fetchall()

    products_list = []
    for row in db_products:
        products_list.append({
            "id": row["id"],
            "name": row["name"],
            "size": row["size"] or "",
            "description": row["description"] or "",
            "category": row["category"] or "medium",
            "price": row["price"],
            "oldPrice": row["old_price"] or 0,
            "badge": row["badge"] or "",
            "emoji": row["emoji"] or "🪴",
            "image": row["image"] or ""
        })

    cursor.execute("SELECT * FROM reviews WHERE is_active = 1 ORDER BY id DESC")
    db_reviews = cursor.fetchall()

    settings = get_all_settings()
    conn.close()

    return render_template(
        'index.html',
        products=db_products,
        products_json=json.dumps(products_list),
        settings=settings,
        settings_json=json.dumps(settings),
        reviews=db_reviews
    )


@app.route('/style.css')
def serve_root_css():
    return send_from_directory('.', 'style.css')


@app.route('/script.js')
def serve_root_js():
    return send_from_directory('.', 'script.js')


@app.route('/api/products')
def api_products():
    """Returns all active products for the storefront."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, size, description, category, price, old_price, badge, emoji, image, is_active
        FROM products 
        WHERE is_active = 1 
        ORDER BY id ASC
    """)
    products = []
    for row in cursor.fetchall():
        products.append({
            "id": row["id"],
            "name": row["name"],
            "size": row["size"] or "",
            "description": row["description"] or "",
            "category": row["category"] or "medium",
            "price": row["price"],
            "oldPrice": row["old_price"] or 0,
            "badge": row["badge"] or "",
            "emoji": row["emoji"] or "🪴",
            "image": row["image"] or ""
        })
    conn.close()
    return jsonify(products)


@app.route('/api/categories')
def api_categories():
    """Returns categories list."""
    cats = get_categories_list()
    return jsonify([{"slug": c["slug"], "name": c["name"]} for c in cats])


@app.route('/api/settings')
def api_settings():
    """Returns public settings for the storefront."""
    settings = get_all_settings()
    return jsonify({
        "phone": settings.get("phone", "+380 99 123 45 67"),
        "email": settings.get("email", "info@polikashpo.ua"),
        "address": settings.get("address", "м. Київ, вул. Хрещатик 10"),
        "hours": settings.get("hours", "Пн-Пт: 9:00-18:00, Сб: 10:00-15:00"),
        "heroTitle1": settings.get("hero_title1", "Кашпо з поліротангу"),
        "heroTitle2": settings.get("hero_title2", "красиво і практично"),
        "heroDesc": settings.get("hero_desc", ""),
        "promo": settings.get("promo", "ПОЛІ15"),
        "insta": settings.get("insta", "#"),
        "tg": settings.get("tg", "#"),
        "fb": settings.get("fb", "#"),
        "site_name": settings.get("site_name", "ПоліКашпо")
    })


@app.route('/api/reviews')
def api_reviews():
    """Returns active reviews for the storefront."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, author_name, city_info, date_str, stars, text
        FROM reviews
        WHERE is_active = 1
        ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    reviews = []
    for r in rows:
        reviews.append({
            "id": r["id"],
            "author_name": r["author_name"],
            "city_info": r["city_info"] or "",
            "date_str": r["date_str"] or "",
            "stars": r["stars"],
            "text": r["text"]
        })
    return jsonify(reviews)


@app.route('/api/order', methods=['POST'])
def api_order():
    """Receives order from customer checkout."""
    data = request.get_json() or request.form
    customer_name = data.get('name') or data.get('customer_name', 'Гість')
    phone = data.get('phone', '')
    city = data.get('city', '')
    warehouse = data.get('warehouse', '')
    comment = data.get('comment', '')
    total_price = int(data.get('total', 0) or data.get('total_price', 0))
    items_json = data.get('items', '')
    if isinstance(items_json, list):
        items_json = ", ".join([f"{item.get('name')} x{item.get('quantity', 1)}" for item in items_json])

    if comment:
        items_json = f"{items_json} | Примітка: {comment}" if items_json else f"Примітка: {comment}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (customer_name, phone, city, warehouse, payment_method, items_json, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    """, (customer_name, phone, city, warehouse, "Накладений платіж", items_json, total_price))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Замовлення успішно створено!"})


@app.route('/api/contact', methods=['POST'])
def api_contact():
    """Receives contact message from storefront."""
    data = request.get_json() or request.form
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    message = data.get('message', '').strip()

    if not name or not message:
        return jsonify({"success": False, "error": "Заповніть ім'я та повідомлення"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO messages (name, phone, message, is_read)
        VALUES (?, ?, ?, 0)
    """, (name, phone, message))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Повідомлення успішно надіслано!"})


# ==========================================
# ADMIN AUTHENTICATION
# ==========================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user['password_hash'], password):
            session['admin_logged_in'] = True
            session['admin_user'] = user['username']
            session['admin_user_id'] = user['id']
            flash(f"Вітаємо, {user['username']}! Ви успішно увійшли в панель керування.", "success")
            next_url = request.args.get('next')
            return redirect(next_url or url_for('admin_dashboard'))
        else:
            flash("Невірний логін або пароль. Спробуйте ще раз.", "error")

    return render_template('admin/login.html')


@app.route('/admin/logout')
def admin_logout():
    session.clear()
    flash("Ви успішно вийшли з системи.", "info")
    return redirect(url_for('admin_login'))


# ==========================================
# ADMIN DASHBOARD
# ==========================================

@app.route('/admin')
@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    conn = get_db()
    cursor = conn.cursor()

    # Product counts
    cursor.execute("SELECT COUNT(*) as total FROM products")
    total_products = cursor.fetchone()['total']

    cursor.execute("SELECT COUNT(*) as active FROM products WHERE is_active = 1")
    active_products = cursor.fetchone()['active']

    cursor.execute("SELECT COUNT(*) as cat_count FROM categories")
    categories_count = cursor.fetchone()['cat_count']

    # Order count
    cursor.execute("SELECT COUNT(*) as orders_count FROM orders")
    total_orders = cursor.fetchone()['orders_count']

    # Messages count
    cursor.execute("SELECT COUNT(*) as msg_count FROM messages")
    total_messages = cursor.fetchone()['msg_count']

    # Reviews count
    cursor.execute("SELECT COUNT(*) as rev_count FROM reviews")
    total_reviews = cursor.fetchone()['rev_count']

    # Recent products
    cursor.execute("SELECT * FROM products ORDER BY id DESC LIMIT 5")
    recent_products = cursor.fetchall()

    # Recent orders
    cursor.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 5")
    recent_orders = cursor.fetchall()

    # Recent messages
    cursor.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 5")
    recent_messages = cursor.fetchall()

    conn.close()

    settings = get_all_settings()

    stats = {
        'total_products': total_products,
        'active_products': active_products,
        'categories_count': categories_count,
        'total_orders': total_orders,
        'total_messages': total_messages,
        'total_reviews': total_reviews
    }

    return render_template(
        'admin/dashboard.html',
        active_page='dashboard',
        stats=stats,
        recent_products=recent_products,
        recent_orders=recent_orders,
        recent_messages=recent_messages,
        settings=settings
    )


# ==========================================
# ADMIN PRODUCTS MANAGEMENT (CRUD)
# ==========================================

@app.route('/admin/products')
@login_required
def admin_products():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()

    sql = "SELECT * FROM products WHERE 1=1"
    params = []

    if query:
        sql += " AND (name LIKE ? OR description LIKE ? OR size LIKE ?)"
        term = f"%{query}%"
        params.extend([term, term, term])

    if category:
        sql += " AND category = ?"
        params.append(category)

    sql += " ORDER BY id DESC"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(sql, params)
    products = cursor.fetchall()
    conn.close()

    categories = get_categories_list()

    return render_template(
        'admin/products/index.html',
        active_page='products',
        products=products,
        categories=categories
    )


@app.route('/admin/products/new', methods=['GET', 'POST'])
@login_required
def admin_product_create():
    categories = get_categories_list()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        size = request.form.get('size', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', 'medium').strip()
        emoji = request.form.get('emoji', '🪴').strip()
        badge = request.form.get('badge', '').strip()
        is_active = 1 if request.form.get('is_active') == '1' else 0

        try:
            price = int(request.form.get('price', 0))
        except ValueError:
            price = 0

        try:
            old_price = int(request.form.get('old_price', 0))
        except ValueError:
            old_price = 0

        # Handle image: file upload takes priority, then url
        image_path = ''
        if 'image_file' in request.files:
            uploaded = save_image_file(request.files['image_file'])
            if uploaded:
                image_path = uploaded

        if not image_path:
            image_path = request.form.get('image_url', '').strip()

        if not name:
            flash('Назва товару є обов’язковою!', 'error')
            return redirect(request.url)

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, size, description, category, price, old_price, badge, emoji, image, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, size, description, category, price, old_price, badge, emoji, image_path, is_active))
        conn.commit()
        conn.close()

        flash(f'Товар «{name}» успішно створено!', 'success')
        return redirect(url_for('admin_products'))

    return render_template(
        'admin/products/form.html',
        active_page='product_add',
        product=None,
        categories=categories
    )


@app.route('/admin/products/<int:id>/edit', methods=['GET', 'POST'])
@login_required
def admin_product_edit(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (id,))
    product = cursor.fetchone()
    categories = get_categories_list()

    if not product:
        conn.close()
        flash('Товар не знайдено!', 'error')
        return redirect(url_for('admin_products'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        size = request.form.get('size', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', 'medium').strip()
        emoji = request.form.get('emoji', '🪴').strip()
        badge = request.form.get('badge', '').strip()
        is_active = 1 if request.form.get('is_active') == '1' else 0

        try:
            price = int(request.form.get('price', 0))
        except ValueError:
            price = 0

        try:
            old_price = int(request.form.get('old_price', 0))
        except ValueError:
            old_price = 0

        # Handle image updates
        remove_image = request.form.get('remove_image') == '1'
        image_path = product['image']

        if remove_image:
            image_path = ''

        if 'image_file' in request.files and request.files['image_file'].filename:
            uploaded = save_image_file(request.files['image_file'])
            if uploaded:
                image_path = uploaded
        elif request.form.get('image_url') and not remove_image:
            image_path = request.form.get('image_url', '').strip()

        if not name:
            flash('Назва товару є обов’язковою!', 'error')
            conn.close()
            return redirect(request.url)

        cursor.execute("""
            UPDATE products 
            SET name = ?, size = ?, description = ?, category = ?, price = ?, old_price = ?, badge = ?, emoji = ?, image = ?, is_active = ?
            WHERE id = ?
        """, (name, size, description, category, price, old_price, badge, emoji, image_path, is_active, id))
        conn.commit()
        conn.close()

        flash(f'Товар «{name}» успішно оновлено!', 'success')
        return redirect(url_for('admin_products'))

    conn.close()
    return render_template(
        'admin/products/form.html',
        active_page='product_edit',
        product=product,
        categories=categories
    )


@app.route('/admin/products/<int:id>/delete', methods=['POST'])
@login_required
def admin_product_delete(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM products WHERE id = ?", (id,))
    product = cursor.fetchone()

    if product:
        name = product['name']
        cursor.execute("DELETE FROM products WHERE id = ?", (id,))
        conn.commit()
        flash(f'Товар «{name}» видалено.', 'info')
    else:
        flash('Товар не знайдено.', 'error')

    conn.close()
    return redirect(url_for('admin_products'))


@app.route('/admin/products/<int:id>/toggle-status', methods=['POST'])
@login_required
def admin_product_toggle_status(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_active, name FROM products WHERE id = ?", (id,))
    product = cursor.fetchone()

    if product:
        new_status = 0 if product['is_active'] else 1
        cursor.execute("UPDATE products SET is_active = ? WHERE id = ?", (new_status, id))
        conn.commit()
        status_text = 'активовано' if new_status else 'приховано'
        flash(f'Товар «{product["name"]}» {status_text}.', 'success')
    conn.close()
    return redirect(request.referrer or url_for('admin_products'))


# ==========================================
# ADMIN CATEGORIES MANAGEMENT
# ==========================================

@app.route('/admin/categories', methods=['GET', 'POST'])
@login_required
def admin_categories():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        slug = request.form.get('slug', '').strip().lower()
        name = request.form.get('name', '').strip()
        sort_order = int(request.form.get('sort_order', 0) or 0)

        if not slug or not name:
            flash('Вкажіть системний код (slug) та назву категорії!', 'error')
        else:
            try:
                cursor.execute("""
                    INSERT INTO categories (slug, name, sort_order)
                    VALUES (?, ?, ?)
                """, (slug, name, sort_order))
                conn.commit()
                flash(f'Категорію «{name}» успішно додано!', 'success')
            except sqlite3.IntegrityError:
                flash(f'Категорія з кодом «{slug}» вже існує!', 'error')

    cursor.execute("""
        SELECT c.*, COUNT(p.id) as products_count 
        FROM categories c
        LEFT JOIN products p ON p.category = c.slug
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
    """)
    categories = cursor.fetchall()
    conn.close()

    return render_template(
        'admin/categories.html',
        active_page='categories',
        categories=categories
    )


@app.route('/admin/categories/<int:id>/delete', methods=['POST'])
@login_required
def admin_category_delete(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT name, slug FROM categories WHERE id = ?", (id,))
    cat = cursor.fetchone()
    if cat:
        cursor.execute("DELETE FROM categories WHERE id = ?", (id,))
        conn.commit()
        flash(f'Категорію «{cat["name"]}» видалено.', 'info')
    conn.close()
    return redirect(url_for('admin_categories'))


# ==========================================
# ADMIN REVIEWS MANAGEMENT
# ==========================================

@app.route('/admin/reviews', methods=['GET', 'POST'])
@login_required
def admin_reviews():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        author_name = request.form.get('author_name', '').strip()
        city_info = request.form.get('city_info', '').strip()
        date_str = request.form.get('date_str', '').strip()
        stars = int(request.form.get('stars', 5))
        text = request.form.get('text', '').strip()

        if author_name and text:
            cursor.execute("""
                INSERT INTO reviews (author_name, city_info, date_str, stars, text, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (author_name, city_info, date_str, stars, text))
            conn.commit()
            flash('Відгук успішно додано!', 'success')
        else:
            flash('Заповніть ім\'я автора та текст відгуку!', 'error')

    cursor.execute("SELECT * FROM reviews ORDER BY id DESC")
    reviews = cursor.fetchall()
    conn.close()

    return render_template(
        'admin/reviews.html',
        active_page='reviews',
        reviews=reviews
    )


@app.route('/admin/reviews/<int:id>/toggle-status', methods=['POST'])
@login_required
def admin_review_toggle_status(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_active FROM reviews WHERE id = ?", (id,))
    rev = cursor.fetchone()
    if rev:
        new_status = 0 if rev['is_active'] else 1
        cursor.execute("UPDATE reviews SET is_active = ? WHERE id = ?", (new_status, id))
        conn.commit()
        flash('Статус відгуку змінено.', 'success')
    conn.close()
    return redirect(url_for('admin_reviews'))


@app.route('/admin/reviews/<int:id>/delete', methods=['POST'])
@login_required
def admin_review_delete(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM reviews WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    flash('Відгук видалено.', 'info')
    return redirect(url_for('admin_reviews'))


# ==========================================
# ADMIN MESSAGES (CONTACT FORM INBOX)
# ==========================================

@app.route('/admin/messages')
@login_required
def admin_messages():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY id DESC")
    messages = cursor.fetchall()
    conn.close()

    return render_template(
        'admin/messages.html',
        active_page='messages',
        messages=messages
    )


@app.route('/admin/messages/<int:id>/toggle-read', methods=['POST'])
@login_required
def admin_message_toggle_read(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT is_read FROM messages WHERE id = ?", (id,))
    msg = cursor.fetchone()
    if msg:
        new_status = 0 if msg['is_read'] else 1
        cursor.execute("UPDATE messages SET is_read = ? WHERE id = ?", (new_status, id))
        conn.commit()
    conn.close()
    return redirect(url_for('admin_messages'))


@app.route('/admin/messages/<int:id>/delete', methods=['POST'])
@login_required
def admin_message_delete(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    flash('Повідомлення видалено.', 'info')
    return redirect(url_for('admin_messages'))


# ==========================================
# ADMIN SETTINGS & PASSWORD CHANGE
# ==========================================

@app.route('/admin/settings', methods=['GET', 'POST'])
@login_required
def admin_settings():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        fields = [
            'site_name', 'phone', 'email', 'address', 'hours',
            'hero_title1', 'hero_title2', 'hero_desc',
            'promo', 'insta', 'tg', 'fb'
        ]
        for field in fields:
            val = request.form.get(field, '').strip()
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (field, val))
        conn.commit()
        conn.close()

        flash('Налаштування магазину успішно збережено!', 'success')
        return redirect(url_for('admin_settings'))

    settings = get_all_settings()
    conn.close()
    return render_template(
        'admin/settings.html',
        active_page='settings',
        settings=settings
    )


@app.route('/admin/change-password', methods=['POST'])
@login_required
def admin_change_password():
    current_password = request.form.get('current_password', '')
    new_password = request.form.get('new_password', '')
    confirm_password = request.form.get('confirm_password', '')

    if new_password != confirm_password:
        flash('Новий пароль та підтвердження не співпадають!', 'error')
        return redirect(url_for('admin_settings'))

    conn = get_db()
    cursor = conn.cursor()
    user_id = session.get('admin_user_id')
    cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    if not user or not check_password_hash(user['password_hash'], current_password):
        flash('Поточний пароль введено невірно!', 'error')
        conn.close()
        return redirect(url_for('admin_settings'))

    new_hash = generate_password_hash(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user_id))
    conn.commit()
    conn.close()

    flash('Пароль адміністратора успішно змінено!', 'success')
    return redirect(url_for('admin_settings'))


# ==========================================
# ADMIN ORDERS MANAGEMENT
# ==========================================

@app.route('/admin/orders')
@login_required
def admin_orders():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    orders = cursor.fetchall()
    conn.close()

    return render_template(
        'admin/orders.html',
        active_page='orders',
        orders=orders
    )


@app.route('/admin/orders/<int:id>/status', methods=['POST'])
@login_required
def admin_order_status(id):
    status = request.form.get('status', 'new')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (status, id))
    conn.commit()
    conn.close()

    flash(f'Статус замовлення #{id} змінено на «{status}».', 'success')
    return redirect(url_for('admin_orders'))


@app.route('/admin/orders/<int:id>/delete', methods=['POST'])
@login_required
def admin_order_delete(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM orders WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    flash(f'Замовлення #{id} видалено.', 'info')
    return redirect(url_for('admin_orders'))


# ==========================================
# INITIALIZATION & LAUNCH
# ==========================================

init_db()

if __name__ == '__main__':
    print("==================================================")
    print("🚀 ПоліКашпо Admin Panel запускається!")
    print("Магазин:      http://127.0.0.1:5000/")
    print("Адмін-панель: http://127.0.0.1:5000/admin")
    print("Логін:        admin")
    print("Пароль:       admin123")
    print("==================================================")
    app.run(debug=True, host='127.0.0.1', port=5000)
