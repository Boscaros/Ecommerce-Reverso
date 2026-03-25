import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Testing Registration without CPF (should succeed!)...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "NoCpfUser", "email": "nocpf@test.com", "phone_number": "11999999999",
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    
    # Se já existir do teste anterior
    if res.status_code == 400 and "Email already registered" in res.text:
        # Usa outro
         res = requests.post(f"{BASE_URL}/users/", json={
            "name": "NoCpfUser", "email": "nocpf2@test.com", "phone_number": "11999999999",
            "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
        })
        
    assert res.status_code == 200, f"Failed to accept user without CPF! {res.text}"
    created_user = res.json()
    print("   -> Success: User Created without CPF. ID:", created_user['id'])

    print("2. Testing Profile Update with INVALID CPF...")
    # Invalid mathematical CPF
    res_invalid_profile = requests.put(f"{BASE_URL}/users/{created_user['id']}/profile", json={
        "street": "Test Street", "number": "123", "complement": "", "neighborhood": "Center", "zipcode": "12345123", "cpf": "11111111111"
    })
    assert res_invalid_profile.status_code == 422, f"Allowed invalid CPF! {res_invalid_profile.text}"
    print("   -> Success: Mathematically invalid CPF rejected on Profile Update.")

    print("3. Testing Profile Update with VALID CPF...")
    from validate_docbr import CPF
    valid_cpf_for_test = CPF().generate()
    res_valid_profile = requests.put(f"{BASE_URL}/users/{created_user['id']}/profile", json={
        "street": "Test Street", "number": "123", "complement": "", "neighborhood": "Center", "zipcode": "12345123", "cpf": valid_cpf_for_test
    })
    
    if res_valid_profile.status_code == 400 and "CPF já está sendo usado" in res_valid_profile.text:
         print("   -> Success: Valid CPF recognized but rejected (already existed).")
    else:
         assert res_valid_profile.status_code == 200, f"Failed to accept valid CPF! {res_valid_profile.text}"
         print("   -> Success: Valid CPF accepted in Profile Update.")

    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
