import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Creating User 1 to satisfy Foreign Keys...")
    requests.post(f"{BASE_URL}/users/", json={
        "name": "Test User", "email": "test@domain.com", "phone_number": "11999999999",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })

    print("2. Creating Purchase Request...")
    res = requests.post(f"{BASE_URL}/requests/?user_id=1", json={
        "title": "Test Title", 
        "description": "Test Description", 
        "product_category": "Eletrônicos", 
        "target_price_cents": 1000
    })
    
    print(res.status_code)
    print(res.text)

if __name__ == "__main__":
    run_tests()
