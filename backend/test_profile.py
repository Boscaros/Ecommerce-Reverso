import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Testing Registration with WEAK password...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "WeakUser", "email": "weak@test.com", "phone_number": "11999999999",
        "password": "weak", "password_confirm": "weak"
    })
    assert res.status_code == 422, f"Allowed weak password! {res.text}"
    print("   -> Success: Weak password rejected.")

    print("2. Testing Registration with MISMATCHED passwords...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "MismatchUser", "email": "mismatch@test.com", "phone_number": "11999999999",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword2!"
    })
    assert res.status_code == 422, f"Allowed mismatched passwords! {res.text}"
    print("   -> Success: Mismatched password rejected.")

    print("3. Testing Registration with VALID STRONG password and PHONE...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "BuyerTest", "email": "buyer@test.com", "phone_number": "11988887777",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    assert res.status_code == 200, f"Failed to create buyer matching criteria: {res.text}"
    buyer = res.json()
    print("   -> Created user with ID:", buyer["id"])

    print("4. Testing Profile Update (Address and Zipcode)...")
    res = requests.put(f"{BASE_URL}/users/{buyer['id']}/profile", json={
        "address": "Rua Exemplo, 123 - Centro", "zipcode": "12345-678"
    })
    assert res.status_code == 200, f"Failed to update profile: {res.text}"
    profile = res.json()
    assert profile["address"] == "Rua Exemplo, 123 - Centro", "Address was not updated"
    assert profile["zipcode"] == "12345-678", "Zipcode was not updated"
    print("   -> Success: Updated Profile address and zipcode.")


    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
