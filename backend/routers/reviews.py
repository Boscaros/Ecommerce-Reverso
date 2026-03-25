from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify that current user is the reviewer
    reviewer_id = current_user.id
    
    # 1. Obter o Request
    req = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == review.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")
    
    # 2. Obter a Oferta Aceita
    offer = db.query(models.Offer).filter(models.Offer.request_id == review.request_id, models.Offer.status == "accepted").first()
    if not offer:
        raise HTTPException(status_code=400, detail="Não há oferta aceita para este pedido, não é possível avaliar.")
        
    # 3. Validar se o reviewer faz parte da transação (é o comprador ou o vendedor)
    participants = [req.buyer_id, offer.seller_id]
    if reviewer_id not in participants:
        raise HTTPException(status_code=403, detail="Você não participou desta transação.")
        
    # 4. Validar se o reviewee é a outra parte da transação
    expected_reviewee_id = offer.seller_id if reviewer_id == req.buyer_id else req.buyer_id
    if review.reviewee_id != expected_reviewee_id:
        raise HTTPException(status_code=400, detail="Você só pode avaliar a outra parte desta transação.")

    # 5. Validar duplicidade
    existing_review = db.query(models.Review).filter(
        models.Review.request_id == review.request_id,
        models.Review.reviewer_id == reviewer_id
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Você já avaliou esta transação.")
        
    # 6. Validar rating (1 a 5)
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="A avaliação deve ser entre 1 e 5.")

    db_review = models.Review(
        request_id=review.request_id,
        reviewer_id=reviewer_id,
        reviewee_id=review.reviewee_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/user/{user_id}", response_model=List[schemas.ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.reviewee_id == user_id).all()
    return reviews
