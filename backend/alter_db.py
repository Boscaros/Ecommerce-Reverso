import sqlite3
import os

db_path = "ecommerce_reverso.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE purchase_requests ADD COLUMN product_condition VARCHAR DEFAULT 'Não informado';")
        conn.commit()
        print("Column added successfully.")
    except Exception as e:
        print("Error or column already exists:", e)
    conn.close()
