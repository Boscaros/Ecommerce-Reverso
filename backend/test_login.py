import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Creating User 1...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "Test Login", "email": "testlogin@test.com", "phone_number": "11999999999",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    
    if res.status_code == 200:
        print("   -> Success: User created.")
    elif res.status_code == 400 and "já registrado" in res.text:
        print("   -> Info: User already exists, proceeding to login test.")
    else:
        print(f"   -> Failed: {res.text}")
        return

    print("2. Testing Duplicate Registration...")
    res_dup = requests.post(f"{BASE_URL}/users/", json={
        "name": "Test Login Dup", "email": "TeStLoGin@test.com", "phone_number": "11999999999",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    assert res_dup.status_code == 400, f"Allowed duplicate! {res_dup.text}"
    print("   -> Success: Duplicate rejected with 400.")

    print("3. Testing Login (Valid Match)...")
    res_login = requests.post(f"{BASE_URL}/users/login", json={
        "email": "testlogin@test.com", "password": "StrongPassword1!"
    })
    assert res_login.status_code == 200, f"Login failed! {res_login.text}"
    print("   -> Success: Logged in.")

    print("4. Testing Login (Invalid Match)...")
    res_login_bad = requests.post(f"{BASE_URL}/users/login", json={
        "email": "testlogin@test.com", "password": "WrongPassword1!"
    })
    assert res_login_bad.status_code == 401, f"Allowed bad login! {res_login_bad.text}"
    print("   -> Success: Bad login rejected.")

    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
