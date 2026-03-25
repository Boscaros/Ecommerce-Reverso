import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Creating User 2 to test Reset Flow...")
    requests.post(f"{BASE_URL}/users/", json={
        "name": "Reset Test", "email": "resettarget@test.com", "phone_number": "000",
        "password": "OldPassword1!", "password_confirm": "OldPassword1!"
    })

    print("2. Simulating Forgot Password Request...")
    res_forgot = requests.post(f"{BASE_URL}/users/forgot-password", json={
        "email": "RESETTARGET@TEST.com"
    })
    print("   ->", res_forgot.json())

    print("3. Executing Reset Password with valid rules...")
    res_reset = requests.post(f"{BASE_URL}/users/reset-password", json={
        "email": "resettarget@test.com",
        "new_password": "NewStrongPassword2@",
        "new_password_confirm": "NewStrongPassword2@"
    })
    print("   ->", res_reset.json())
    assert res_reset.status_code == 200, "Failed to reset."

    print("4. Testing Login with New Password...")
    res_login = requests.post(f"{BASE_URL}/users/login/", json={
        "email": "resettarget@test.com", "password": "NewStrongPassword2@"
    })
    if res_login.status_code == 200:
        print("   -> Success: Logged in properly.")
    else:
        print("   -> Failed:", res_login.text)

if __name__ == "__main__":
    run_tests()
