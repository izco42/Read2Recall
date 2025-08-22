from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.endpoints import llm 
from api.v1.endpoints import decks 
from api.v1.endpoints import templates
from api.v1.endpoints import users 
from api.v1.endpoints import sync

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(llm.router, prefix="/llm", tags=["LLM"])
app.include_router(decks.router, prefix="/decks", tags=["Decks"])
app.include_router(decks.schemasRouter, prefix="/schemas", tags=["Schemas Create Deck"])
app.include_router(templates.router, prefix="/templates", tags=["Templates"])
app.include_router(users.router, prefix="/auth", tags=["Auth"])
app.include_router(sync.router, prefix="/sync", tags=["Sync"])
