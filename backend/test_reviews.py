import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from auth import create_access_token
import models
import os

# Create a clean test db for this module
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_reviews.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def create_mock_user(db, name, email, role="buyer"):
    import bcrypt
    salt = bcrypt.gensalt()
    pw = bcrypt.hashpw(b"Password123!", salt).decode('utf-8')
    user = models.User(name=name, email=email, password_hash=pw, phone_number="11999999999", is_email_verified=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_mock_request(db, buyer_id):
    req = models.PurchaseRequest(buyer_id=buyer_id, title="Test", description="Test obj", product_category="Outros", target_price_cents=1000)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

def create_mock_offer(db, request_id, seller_id, status="pending"):
    off = models.Offer(request_id=request_id, seller_id=seller_id, offer_price_cents=900, status=status)
    db.add(off)
    db.commit()
    db.refresh(off)
    return off

def get_token(user_id):
    return create_access_token(data={"sub": str(user_id)})

def test_create_review_success():
    db = TestingSessionLocal()
    buyer = create_mock_user(db, "Buyer", "buyer@test.com")
    seller = create_mock_user(db, "Seller", "seller@test.com")
    req = create_mock_request(db, buyer.id)
    off = create_mock_offer(db, req.id, seller.id, status="accepted")
    db.close()

    token = get_token(buyer.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/reviews/", headers=headers, json={
        "rating": 5,
        "comment": "Ótimo!",
        "request_id": req.id,
        "reviewee_id": seller.id
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["rating"] == 5
    assert data["reviewer_id"] == buyer.id
    assert data["reviewee_id"] == seller.id

def test_create_review_fails_not_accepted():
    db = TestingSessionLocal()
    buyer = create_mock_user(db, "Buyer", "buyer@test.com")
    seller = create_mock_user(db, "Seller", "seller@test.com")
    req = create_mock_request(db, buyer.id)
    # Pending offer!
    off = create_mock_offer(db, req.id, seller.id, status="pending")
    db.close()

    token = get_token(buyer.id)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/reviews/", headers=headers, json={
        "rating": 5,
        "request_id": req.id,
        "reviewee_id": seller.id
    })
    assert response.status_code == 400
    assert "Não há oferta aceita" in response.json()["detail"]

def test_get_user_reviews():
    db = TestingSessionLocal()
    buyer = create_mock_user(db, "Buyer", "buyer@test.com")
    seller = create_mock_user(db, "Seller", "seller@test.com")
    req = create_mock_request(db, buyer.id)
    off = create_mock_offer(db, req.id, seller.id, status="accepted")
    
    # create the review
    rev = models.Review(request_id=req.id, reviewer_id=buyer.id, reviewee_id=seller.id, rating=4)
    db.add(rev)
    db.commit()
    db.close()
    
    # get user avg
    response = client.get(f"/users/{seller.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] == 1
    assert data["average_rating"] == 4.0
