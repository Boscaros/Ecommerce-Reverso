import requests

BASE_URL = "http://localhost:8000"

def seed():
    # 1. Create a buyer
    user_payload = {
        "name": "Maria Compradora",
        "email": "maria.compras@email.com",
        "phone_number": "11988887777",
        "password": "Password123!",
        "password_confirm": "Password123!"
    }
    
    r = requests.post(f"{BASE_URL}/users/", json=user_payload)
    
    buyer_id = None
    if r.status_code == 200:
        buyer_id = r.json().get("id")
    else:
        # User might exist
        r_login = requests.post(f"{BASE_URL}/users/login", json={"email": user_payload["email"], "password": user_payload["password"]})
        if r_login.status_code == 200:
            buyer_id = r_login.json().get("id")
            
    if not buyer_id:
        print("Could not get buyer ID.")
        return
        
    # 2. Create the Request
    req_payload = {
        "title": "Procuro iPhone 13 Pro Max",
        "description": "Estou procurando um iPhone 13 Pro Max em boa condição. Gostaria que a bateria estivesse acima de 85%. Pode ter marcas de uso nas bordas. Por favor, enviem fotos reais do aparelho nas ofertas!",
        "product_category": "Eletrônicos",
        "target_price_cents": 350000 
    }
    
    r_req = requests.post(f"{BASE_URL}/requests/?user_id={buyer_id}", json=req_payload)
    
    if r_req.status_code == 200:
        print(f"Pedido criado com sucesso! ID: {r_req.json().get('id')}")
    else:
        print("Erro ao criar pedido:", r_req.text)

if __name__ == "__main__":
    seed()
