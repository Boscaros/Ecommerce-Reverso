from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    phone_number = Column(String, nullable=True)
    zipcode = Column(String, nullable=True)
    street = Column(String, nullable=True)
    number = Column(String, nullable=True)
    complement = Column(String, nullable=True)
    neighborhood = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    cpf = Column(String, unique=True, index=True, nullable=True)
    is_email_verified = Column(Boolean, default=False)
    
    requests = relationship("PurchaseRequest", back_populates="buyer")
    offers = relationship("Offer", back_populates="seller")

class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(String)
    product_category = Column(String, default="Outros")
    product_condition = Column(String, default="Não informado")
    target_price_cents = Column(Integer)
    city = Column(String, default="Não informada")
    is_open = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    buyer = relationship("User", back_populates="requests")
    offers = relationship("Offer", back_populates="request")

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    offer_price_cents = Column(Integer)
    image_url = Column(String, nullable=True)
    status = Column(String, default="pending") # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    request = relationship("PurchaseRequest", back_populates="offers")
    seller = relationship("User", back_populates="offers")
    messages = relationship("Message", back_populates="offer")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    text_content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    offer = relationship("Offer", back_populates="messages")
    sender = relationship("User")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewee_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
    request = relationship("PurchaseRequest")
