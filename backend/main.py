from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

import models
from database import engine

from routers import users, requests, offers, chat, reviews

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce Reverso API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(requests.router)
app.include_router(offers.router)
app.include_router(chat.router)
app.include_router(reviews.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API de E-commerce Reverso rodando!"}
