from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
import os
import shutil
import uuid
from auth import get_current_user

router = APIRouter(prefix="/offers", tags=["offers"])

@router.post("/", response_model=schemas.OfferResponse)
def create_offer(
    request_id: int = Form(...), 
    seller_id: int = Form(...),
    offer_price_cents: int = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.id != seller_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    # Validate Request exists
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
        
    image_url = None
    if image and image.filename:
        # Create a unique filename to avoid collision
        extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = os.path.join("uploads", unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        image_url = f"/uploads/{unique_filename}"
        
    db_offer = models.Offer(
        offer_price_cents=offer_price_cents, 
        request_id=request_id, 
        seller_id=seller_id,
        image_url=image_url
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.get("/request/{request_id}", response_model=List[schemas.OfferResponse])
def get_offers_for_request(request_id: int, db: Session = Depends(get_db)):
    offers = db.query(models.Offer).filter(models.Offer.request_id == request_id).all()
    return offers

@router.get("/{offer_id}", response_model=schemas.OfferWithRequest)
def get_offer(offer_id: int, db: Session = Depends(get_db)):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")
    return db_offer

@router.post("/{offer_id}/checkout")
def create_checkout_preference(offer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")
        
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == db_offer.request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
    if db_request.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Apenas o dono do pedido pode iniciar o pagamento")
        
    if not db_request.is_open:
         raise HTTPException(status_code=400, detail="Este pedido já foi encerrado")
         
    import uuid
    payment_id = str(uuid.uuid4())
    
    return {
        "status": "success", 
        "preference_id": payment_id,
        "message": "Preferência de pagamento criada (Simulação)"
    }

@router.put("/{offer_id}/accept")
def accept_offer(offer_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")
    
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == db_offer.request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
    if db_request.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Apenas o dono do pedido pode aceitar a oferta")
        
    if not db_request.is_open:
        raise HTTPException(status_code=400, detail="Este pedido já foi encerrado")
        
    # Aceita a oferta
    db_offer.status = "accepted"
    
    # Rejeita as outras ofertas do mesmo pedido
    other_offers = db.query(models.Offer).filter(
        models.Offer.request_id == db_request.id,
        models.Offer.id != db_offer.id
    ).all()
    
    for offer in other_offers:
        offer.status = "rejected"
        
    # Fecha o pedido
    db_request.is_open = False
    
    db.commit()
    return {"status": "success", "message": "Oferta aceita e pedido encerrado com sucesso"}

@router.get("/user/{user_id}", response_model=List[schemas.OfferWithRequest])
def get_user_offers(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    offers = db.query(models.Offer).filter(models.Offer.seller_id == user_id).order_by(models.Offer.created_at.desc()).all()
    return offers
