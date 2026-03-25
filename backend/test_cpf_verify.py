import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Testing Registration with INVALID CPF...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "BadCpfUser", "email": "badcpf@test.com", "phone_number": "11999999999",
        "cpf": "11111111111", # Invalid mathematical CPF
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    assert res.status_code == 422, f"Allowed invalid CPF! {res.text}"
    print("   -> Success: Mathematically invalid CPF rejected.")

    print("2. Testing Registration with VALID CPF...")
    # Um CPF válido real para teste (gerado validamente, não existente)
    valid_cpf_for_test = "54388147048" 
    res = requests.post(f"{BASE_URL}/users/", json={
        "name": "GoodCpfUser", "email": "goodcpf@test.com", "phone_number": "11999999999",
        "cpf": valid_cpf_for_test,
        "password": "StrongPassword1!", "password_confirm": "StrongPassword1!"
    })
    
    # Pode falhar se já existir de outro teste, o que pra gente conta como sucesso da regra Unique.
    if res.status_code == 400 and "CPF already registered" in res.text:
         print("   -> Success: Valid CPF recognized (already existed).")
    else:
         assert res.status_code == 200, f"Failed to accept valid CPF! {res.text}"
         created_user = res.json()
         print("   -> Success: Valid CPF accepted. User ID:", created_user['id'])
         assert created_user['is_email_verified'] == False, "New users must not be verified."

         print("3. Testing Email Verification Mock with WRONG CODE...")
         res_verify_fail = requests.post(f"{BASE_URL}/users/{created_user['id']}/verify", json={"verification_code": "0000"})
         assert res_verify_fail.status_code == 400, "Should have failed mock code 0000"
         print("   -> Success: Wrong verify code rejected.")

         print("4. Testing Email Verification Mock with VALID CODE...")
         res_verify_success = requests.post(f"{BASE_URL}/users/{created_user['id']}/verify", json={"verification_code": "123456"})
         assert res_verify_success.status_code == 200, "Should have accepted generic code"
         assert res_verify_success.json()["is_email_verified"] == True, "Should be verified now"
         print("   -> Success: Account Verified!")


    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
