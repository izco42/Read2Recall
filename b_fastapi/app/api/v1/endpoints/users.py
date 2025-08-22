from fastapi import APIRouter, HTTPException
from schemas.user_schema import UserRegister, UserLogin , UserResponse , LoginResponse 
from services.user_service import login_user, signup_user

router = APIRouter()

@router.post("/log-in",response_model=LoginResponse)
async def login_handler(payload: UserLogin):
    try:
        result = await login_user(payload.email, payload.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sign-up", response_model=UserResponse)
async def signup_handler(payload: UserRegister):
    try:
        result = await signup_user(payload.email, payload.password, payload.name)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))