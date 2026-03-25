from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/requests", tags=["requests"])

@router.post("/", response_model=schemas.PurchaseRequestResponse)
def create_request(request: schemas.PurchaseRequestCreate, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    db_request = models.PurchaseRequest(**request.model_dump(), buyer_id=user_id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/", response_model=List[schemas.PurchaseRequestResponse])
def get_all_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    requests = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.is_open == True).offset(skip).limit(limit).all()
    return requests

@router.get("/{request_id}", response_model=schemas.PurchaseRequestResponse)
def get_request(request_id: int, db: Session = Depends(get_db)):
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.get("/user/{user_id}", response_model=List[schemas.PurchaseRequestResponse])
def get_user_requests(user_id: int, db: Session = Depends(get_db)):
    requests = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.buyer_id == user_id).all()
    return requests

@router.delete("/{request_id}")
def delete_request(request_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == request_id).first()
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    if db_request.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this request")
    
    # Exclui ofertas relacionadas primeiro para evitar IntegrityError se habilitado nas FKs do banco
    offers = db.query(models.Offer).filter(models.Offer.request_id == request_id).all()
    for offer in offers:
        db.query(models.Message).filter(models.Message.offer_id == offer.id).delete()
    db.query(models.Offer).filter(models.Offer.request_id == request_id).delete()
    
    db.delete(db_request)
    db.commit()
    return {"status": "success", "message": "Pedido excluído com sucesso"}
