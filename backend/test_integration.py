import requests
import json

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Creating Buyer...")
    res = requests.post(f"{BASE_URL}/users/", json={"name": "BuyerTest", "email": "buyer@test.com", "password": "123"})
    if res.status_code == 400:
        print("Buyer already exists.")
        # Just pretend it succeeded if it already exists or fetch it
    else:
        assert res.status_code == 200, f"Failed to create buyer: {res.text}"
    buyer = res.json() if res.status_code == 200 else {"id": 1}

    print("2. Creating Seller...")
    res = requests.post(f"{BASE_URL}/users/", json={"name": "SellerTest", "email": "seller@test.com", "password": "123"})
    if res.status_code != 400:
        assert res.status_code == 200, f"Failed to create seller: {res.text}"
    seller = res.json() if res.status_code == 200 else {"id": 2}

    print("3. Creating Purchase Request...")
    res = requests.post(f"{BASE_URL}/requests/?user_id={buyer['id']}", json={
        "title": "Test Item", "description": "Looking for it", "target_price_cents": 10000
    })
    assert res.status_code == 200, f"Failed to create request: {res.text}"
    req_id = res.json()["id"]

    print("4. Creating Offer...")
    res = requests.post(f"{BASE_URL}/offers/?request_id={req_id}&seller_id={seller['id']}", json={
        "offer_price_cents": 9500
    })
    assert res.status_code == 200, f"Failed to create offer: {res.text}"
    offer_id = res.json()["id"]

    print("5. Verifying Offer appears in Request details...")
    res = requests.get(f"{BASE_URL}/requests/{req_id}")
    assert res.status_code == 200
    assert len(res.json()["offers"]) > 0

    print("ALL TESTS PASSED!")

if __name__ == "__main__":
    run_tests()
