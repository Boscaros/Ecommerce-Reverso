from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import List, Optional
import re
from validate_docbr import CPF

cpf_validator = CPF()

# Users
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str
    password_confirm: str

    @validator('password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula.")
        if not re.search(r"[0-9]", v):
            raise ValueError("A senha deve conter pelo menos um número.")
        if not re.search(r"[\W_]", v):
            raise ValueError("A senha deve conter pelo menos um caractere especial.")
        return v
    
    @validator('password_confirm')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError("As senhas não conferem.")
        return v

class UserUpdateProfile(BaseModel):
    zipcode: str
    cpf: str
    street: str
    number: str
    complement: Optional[str] = None
    neighborhood: str
    city: str
    state: str

    @validator('cpf')
    def validate_cpf_strength(cls, v):
        num_cpf = re.sub(r'\D', '', v)
        if len(num_cpf) != 11 or not cpf_validator.validate(num_cpf):
            raise ValueError("O CPF informado é inválido matematicamente.")
        return num_cpf

class UserResponse(UserBase):
    id: int
    cpf: Optional[str] = None
    zipcode: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    is_email_verified: bool
    average_rating: Optional[float] = None
    total_reviews: Optional[int] = None
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class VerifyEmailRequest(BaseModel):
    verification_code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str
    new_password_confirm: str
    
    @validator('new_password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("A senha deve ter pelo menos 8 caracteres.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula.")
        if not re.search(r"[0-9]", v):
            raise ValueError("A senha deve conter pelo menos um número.")
        if not re.search(r"[\W_]", v):
            raise ValueError("A senha deve conter pelo menos um caractere especial.")
        return v
    
    @validator('new_password_confirm')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError("As senhas não conferem.")
        return v

# Messages
class MessageBase(BaseModel):
    text_content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    offer_id: int
    sender_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Offers
class OfferBase(BaseModel):
    offer_price_cents: int
    image_url: Optional[str] = None
    image_url: Optional[str] = None

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: int
    request_id: int
    seller_id: int
    status: str
    created_at: datetime
    messages: List[MessageResponse] = []
    class Config:
        from_attributes = True

class PurchaseRequestMinimal(BaseModel):
    title: str
    product_category: str
    product_condition: str = "Não informado"
    class Config:
        from_attributes = True

class OfferWithRequest(OfferResponse):
    request: PurchaseRequestMinimal
    class Config:
        from_attributes = True

# Purchase Requests
class PurchaseRequestBase(BaseModel):
    title: str
    description: str
    product_category: str
    product_condition: str
    target_price_cents: int
    city: str = "Não informada"

class PurchaseRequestCreate(PurchaseRequestBase):
    pass

class PurchaseRequestResponse(PurchaseRequestBase):
    id: int
    buyer_id: int
    is_open: bool
    created_at: datetime
    offers: List[OfferResponse] = []
    class Config:
        from_attributes = True

# Reviews
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    request_id: int
    reviewee_id: int

class ReviewResponse(ReviewBase):
    id: int
    request_id: int
    reviewer_id: int
    reviewee_id: int
    created_at: datetime
    class Config:
        from_attributes = True
