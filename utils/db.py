import sqlite3

NUM_FEATURES = 54
COLUMN_NAMES = [f'feature{i}' for i in range(NUM_FEATURES)]

def get_db_connection():
    conn = sqlite3.connect('eeg_data.db')
    conn.row_factory = sqlite3.Row  # So we can return rows as dicts
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # EEG data table
    columns = ', '.join([f'{col} REAL' for col in COLUMN_NAMES])
    c.execute(f'''
        CREATE TABLE IF NOT EXISTS eeg_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            {columns}
        )
    ''')

    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT,
            role TEXT DEFAULT 'user',
            bio TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            predicted_class TEXT NOT NULL,
            input_data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users (email)
        )
    ''')

    conn.commit()
    conn.close()

def insert_data(input_data):
    conn = get_db_connection()
    c = conn.cursor()
    column_names_str = ', '.join(COLUMN_NAMES)
    placeholders = ', '.join(['?'] * NUM_FEATURES)
    c.execute(f'''
        INSERT INTO eeg_data ({column_names_str}) VALUES ({placeholders})
    ''', input_data)
    conn.commit()
    record_id = c.lastrowid
    conn.close()
    return record_id

def insert_user(user_data):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT OR IGNORE INTO users (name, email, password, role, bio)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_data['name'],
            user_data['email'],
            user_data['password'],
            user_data.get('role', 'user'),  # 👈 use default if missing
            user_data.get('bio', '')  # Default empty bio
        ))
        conn.commit()
    finally:
        conn.close()

def insert_prediction(email, input_data, predicted_class):
    """Store prediction with user email and input data (as string)."""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO predictions (user_email, input_data, predicted_class)
        VALUES (?, ?, ?)
    ''', (email, str(input_data), predicted_class))
    conn.commit()
    conn.close()

def fetch_user(email):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, name, email, password, role, bio FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def fetch_data(record_id):
    conn = get_db_connection()
    c = conn.cursor()
    column_names_str = ', '.join(COLUMN_NAMES)
    c.execute(f'''
        SELECT {column_names_str} FROM eeg_data WHERE id = ?
    ''', (record_id,))
    data = c.fetchone()
    conn.close()
    return data

def insert_prediction(email, input_data, predicted_class):
    """Optional: Save prediction result linked to user email"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        INSERT INTO predictions (user_email, input_data, predicted_class)
        VALUES (?, ?, ?)
    ''', (email, str(input_data), predicted_class))
    conn.commit()
    conn.close()

def get_user_predictions(email):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        SELECT id, input_data, predicted_class, created_at
        FROM predictions
        WHERE user_email = ?
        ORDER BY created_at DESC
    ''', (email,))
    results = c.fetchall()
    conn.close()
    return results
def update_user_profile(email, name, bio):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE users
        SET name = ?, bio = ?
        WHERE email = ?
    ''', (name, bio, email))
    conn.commit()
    conn.close()