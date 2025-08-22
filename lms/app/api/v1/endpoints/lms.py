from typing import List
from fastapi import APIRouter, HTTPException
from app.services.lms_service import load_model,start_server, list_models, list_loaded_models, unload_all,stop_server 
from app.schemas.lms_schema import LoadModelRequest , LoadModelResponse , ModelInfo , SimpleResponse , LoadedModelInfo 

router = APIRouter()

@router.post("/start", response_model=SimpleResponse)
async def start_server_endpoint():
    try:
        result = start_server()
        return SimpleResponse(message=result) 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/load", response_model= LoadModelResponse)
async def load_model_endpoint(request: LoadModelRequest):
    try:
        result = load_model(request.modelkey)
        return LoadModelResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unload", response_model=SimpleResponse)
async def unload_all_endpoint():
    try:
        result = unload_all()
        return SimpleResponse(message=result) 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop", response_model=SimpleResponse)
async def stop_server_endpoint():
    try:
        result = stop_server()
        return SimpleResponse(message=result) 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[ModelInfo])
async def list_models_endpoint():
    try:
        return list_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/loaded", response_model=List[LoadedModelInfo])
async def list_loaded_models_endpoint():
    try:
        return list_loaded_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




