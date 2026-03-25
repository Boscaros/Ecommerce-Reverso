import sqlite3

def add_column():
    conn = sqlite3.connect('c:\\Users\\thiag\\.gemini\\antigravity\\scratch\\ecommerce-reverso\\backend\\ecommerce_reverso.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE purchase_requests ADD COLUMN city VARCHAR DEFAULT 'Não informada'")
        print("Coluna city adicionada com sucesso.")
    except sqlite3.OperationalError as e:
        print(f"Ignorando: {e}")
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    add_column()
