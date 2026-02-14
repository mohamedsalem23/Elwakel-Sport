import sqlite3
import os

db_path = os.path.join('backend', 'elwakel.db')
print(f"Checking DB at: {os.path.abspath(db_path)}")

if not os.path.exists(db_path):
    print("DB file not found!")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users';")
    if not cursor.fetchone():
        print("Table 'users' not found!")
    else:
        cursor.execute("SELECT username, hashed_password, is_admin FROM users")
        users = cursor.fetchall()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"Username: {u[0]}, Admin: {u[2]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
