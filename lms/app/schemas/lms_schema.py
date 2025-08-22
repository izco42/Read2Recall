from pydantic import BaseModel, Field
from typing import Optional, List

class LoadModelRequest(BaseModel):
    modelkey: str = Field(..., description="Modelkey to load")

class LoadModelResponse(BaseModel):
     result: str = Field(..., description="Result of the model loading operation") 


class SimpleResponse(BaseModel):
    message: str = Field(..., description="Mensaje con el resultado de la operación")

class ModelBase(BaseModel):
    type: str = Field(..., description="Tipo de modelo (embedding, llm, etc.)")
    modelKey: str = Field(..., description="Clave identificadora del modelo")
    format: str = Field(..., description="Formato del modelo (ejemplo: gguf)")
    displayName: str = Field(..., description="Nombre para mostrar del modelo")
    path: str = Field(..., description="Ruta o ubicación del modelo")
    sizeBytes: int = Field(..., description="Tamaño del modelo en bytes")
    architecture: str = Field(..., description="Arquitectura del modelo")
    maxContextLength: int = Field(..., description="Longitud máxima de contexto")

    paramsString: Optional[str] = Field(None, description="Parámetros adicionales del modelo")
    vision: Optional[bool] = Field(None, description="Indica si el modelo soporta visión")
    trainedForToolUse: Optional[bool] = Field(None, description="Indica si fue entrenado para uso de herramientas") 


class ModelInfo(ModelBase):
    pass

class LoadedModelInfo(ModelBase):
    identifier: str = Field(..., description="Identificador único del modelo cargado")
    instanceReference: str = Field(..., description="Referencia interna a la instancia del modelo")
    contextLength: int = Field(..., description="Longitud actual del contexto")
