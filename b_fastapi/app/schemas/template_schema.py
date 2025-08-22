from pydantic import BaseModel, Field
from typing import List

class TemplateCreateRequest(BaseModel):
    template_name: str = Field(..., description="Nombre del template de Anki")
    front: List[str] = Field(..., description="Campos que van en el anverso")
    back: List[str] = Field(..., description="Campos que van en el reverso") 

class TemplateResponse(BaseModel):
    template_id: int = Field(..., description="ID único del template")
    template_name: str = Field(..., description="Nombre del template de Anki")
    front: List[str] = Field(..., description="Campos que van en el anverso")
    back: List[str] = Field(..., description="Campos que van en el reverso")

class TemplateDeleteRequest(BaseModel):
    template_id: int = Field(..., description="ID único del template a eliminar")

class TemplateDeleteResponse(BaseModel):
    message: str = Field(..., description="Mensaje de confirmación de eliminación del template") 
