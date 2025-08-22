from fastapi import APIRouter, HTTPException
from services.llm_service import query_llm
from schemas.llm_schema import LLMRequest, LLMResponse

router = APIRouter()

@router.post("/query", response_model=LLMResponse)
async def query_model(request: LLMRequest):
    try:
        return await query_llm(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=repr(e))

