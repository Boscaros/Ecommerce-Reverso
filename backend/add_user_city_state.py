import sqlite3

def add_columns():
    conn = sqlite3.connect('c:\\Users\\thiag\\.gemini\\antigravity\\scratch\\ecommerce-reverso\\backend\\ecommerce_reverso.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN city VARCHAR")
        print("Coluna city adicionada.")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN state VARCHAR")
        print("Coluna state adicionada.")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_columns()
