import sqlite3
import os

# Get the path to the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, 'elwakel.db')

def migrate():
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("users", "reset_token", "TEXT"),
        ("users", "reset_token_expires", "DATETIME"),
        ("bookings", "booker_name", "TEXT"),
        ("bookings", "booker_phone", "TEXT"),
    ]

    for table, column, col_type in columns_to_add:
        try:
            print(f"Adding {column} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
        except sqlite3.OperationalError as e:
            print(f"  Column {column} might already exist: {e}")

    conn.commit()
    conn.close()
    print("✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate()
