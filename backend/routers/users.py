from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import bcrypt
from auth import create_access_token, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email.lower()).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já registrado.")
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    new_user = models.User(
        name=user.name, 
        email=user.email.lower(), 
        phone_number=user.phone_number,
        password_hash=hashed_password,
        is_email_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.LoginResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email.lower()).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas. Verifique seu e-mail e senha.")
        
    try:
        # Check pw
        if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
             raise HTTPException(status_code=401, detail="Credenciais inválidas. Verifique seu e-mail e senha.")
    except ValueError:
         raise HTTPException(status_code=401, detail="Credenciais inválidas.")
         
    access_token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": access_token, "user": db_user}

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    reviews = db.query(models.Review).filter(models.Review.reviewee_id == user_id).all()
    db_user.total_reviews = len(reviews)
    if reviews:
        val = float(sum(r.rating for r in reviews)) / len(reviews)
        db_user.average_rating = round(val, 1)
    else:
        db_user.average_rating = 0.0
        
    return db_user

@router.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email.lower()).first()
    if not db_user:
        # Prevent email leaking
        return {"message": "Se o e-mail existir, um link de recuperação foi enviado."}
    
    mock_token = f"reset_{db_user.id}_token_mock"
    return {"message": "Simulação: E-mail de reset enviado com sucesso.", "mock_token": mock_token}

@router.post("/reset-password")
def reset_password(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email.lower()).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(req.new_password.encode('utf-8'), salt).decode('utf-8')
    
    db_user.password_hash = hashed_password
    db.commit()
    
    return {"message": "Senha alterada com sucesso."}
@router.put("/{user_id}/profile", response_model=schemas.UserResponse)
def update_profile(user_id: int, profile: schemas.UserUpdateProfile, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_cpf = db.query(models.User).filter(models.User.cpf == profile.cpf, models.User.id != user_id).first()
    if db_cpf:
        raise HTTPException(status_code=400, detail="Este CPF já está sendo usado por outra conta")
    
    db_user.zipcode = profile.zipcode
    db_user.street = profile.street
    db_user.number = profile.number
    db_user.complement = profile.complement
    db_user.neighborhood = profile.neighborhood
    db_user.city = profile.city
    db_user.state = profile.state
    db_user.cpf = profile.cpf
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/{user_id}/verify", response_model=schemas.UserResponse)
def verify_email(user_id: int, request: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    # Simulação Mock. Qualquer código validará a conta para testes do MVP.
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    if request.verification_code == "0000":
         raise HTTPException(status_code=400, detail="Invalid Mock Code")
         
    db_user.is_email_verified = True
    db.commit()
    db.refresh(db_user)
    return db_user
