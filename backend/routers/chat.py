from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import Dict, List
from auth import SECRET_KEY, ALGORITHM, get_current_user
from jose import jwt, JWTError

router = APIRouter(prefix="/chat", tags=["chat"])

from fastapi import HTTPException

@router.get("/inbox")
def get_user_inbox(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    offers_as_seller = db.query(models.Offer).filter(models.Offer.seller_id == current_user.id).all()
    
    requests_as_buyer = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.buyer_id == current_user.id).all()
    request_ids = [r.id for r in requests_as_buyer]
    offers_as_buyer = db.query(models.Offer).filter(models.Offer.request_id.in_(request_ids)).all() if request_ids else []
    
    all_offers = offers_as_seller + offers_as_buyer
    inbox = []
    
    for offer in all_offers:
        last_msg = db.query(models.Message).filter(models.Message.offer_id == offer.id).order_by(models.Message.created_at.desc()).first()
        req = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == offer.request_id).first()
        
        other_user_id = req.buyer_id if offer.seller_id == current_user.id else offer.seller_id
        other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
        
        inbox.append({
            "offer_id": offer.id,
            "product_title": req.title if req else "Produto",
            "other_user_name": other_user.name if other_user else f"User {other_user_id}",
            "other_user_id": other_user_id,
            "last_message": last_msg.text_content if last_msg else None,
            "last_message_date": last_msg.created_at if last_msg else offer.created_at
        })

    inbox.sort(key=lambda x: x["last_message_date"], reverse=True)
    return inbox

@router.get("/{offer_id}/messages", response_model=List[schemas.MessageResponse])
def get_messages(offer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Oferta não encontrada")
    db_request = db.query(models.PurchaseRequest).filter(models.PurchaseRequest.id == db_offer.request_id).first()
    
    if current_user.id != db_offer.seller_id and current_user.id != db_request.buyer_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    messages = db.query(models.Message).filter(models.Message.offer_id == offer_id).order_by(models.Message.created_at.asc()).all()
    return messages

class ConnectionManager:
    def __init__(self):
        # Maps offer_id to a list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, offer_id: int):
        await websocket.accept()
        if offer_id not in self.active_connections:
            self.active_connections[offer_id] = []
        self.active_connections[offer_id].append(websocket)

    def disconnect(self, websocket: WebSocket, offer_id: int):
        if offer_id in self.active_connections:
            self.active_connections[offer_id].remove(websocket)
            if not self.active_connections[offer_id]:
                del self.active_connections[offer_id]

    async def broadcast(self, message: str, offer_id: int):
        if offer_id in self.active_connections:
            for connection in self.active_connections[offer_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{offer_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, offer_id: int, user_id: int, token: str = None, db: Session = Depends(get_db)):
    if not token:
        await websocket.close(code=1008, reason="Missing Token")
        return
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_user_id = payload.get("sub")
        if token_user_id is None or int(token_user_id) != user_id:
            await websocket.close(code=1008, reason="Invalid Token")
            return
    except JWTError:
        await websocket.close(code=1008, reason="Invalid Token")
        return

    await manager.connect(websocket, offer_id)
    try:
        import json
        while True:
            data = await websocket.receive_text()
            # Save to database
            new_message = models.Message(offer_id=offer_id, sender_id=user_id, text_content=data)
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            # Broadcast to everyone in this offer's chat room
            payload = {
                "id": new_message.id,
                "sender_id": user_id,
                "text_content": data,
                "created_at": new_message.created_at.isoformat()
            }
            await manager.broadcast(json.dumps(payload), offer_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, offer_id)
