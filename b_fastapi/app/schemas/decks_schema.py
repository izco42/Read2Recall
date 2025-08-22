from pydantic import BaseModel, Field, field_validator 
from typing import List

class Flashcard(BaseModel):
    campos_anverso: List[str] = Field(..., description="Campos generados para el anverso de la tarjeta") 
    campo_reverso: List[str] = Field(..., description="Campos generados para el reverso de la tarjeta")

    @field_validator('campos_anverso', mode='before')
    def ensure_campos_anverso_is_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

    @field_validator('campo_reverso', mode='before')
    def ensure_campo_reverso_is_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

class TemplateFields(BaseModel):
    template_name: str = Field(..., description="Nombre del template de Anki")
    template_id: int = Field(..., description="ID del template de Anki")
    front: List[str] = Field(..., description="Lista de campos que van en el anverso")
    back: List[str] = Field(..., description="Lista de campos que van en el reverso")

class PromptInstructions(BaseModel):
    system_prompt: str = Field(..., description="Prompt base o instrucción general del modelo")
    temperature: float = Field(0.7, description="Nivel de creatividad del modelo (0.0 - 1.0)")
    max_tokens: int = Field(2048, description="Número máximo de tokens a generar")

class CreateDeckRequest(BaseModel):
    template: TemplateFields
    prompt: PromptInstructions

class ConfirmDeckRequest(BaseModel):
    deckname : str = Field(..., description="Nombre del mazo a confirmar")
    template : TemplateFields
    flashc : List[Flashcard]

class DeckCreationResult(BaseModel):
    deck_name: str = Field(..., description="Nombre del mazo creado")
    deck_id: int = Field(..., description="ID único del mazo generado")
    file_path: str = Field(..., description="Ruta del archivo .apkg generado")
    template_name: str = Field(..., description="Nombre del template usado")
    template_id: int = Field(..., description="ID del template usado")

class DeckDeleteRequest(BaseModel):
    deck_id: int = Field(..., description="ID único del mazo a eliminar")

class DeckDeleteResponse(BaseModel):
    message: str = Field(..., description="Mensaje de confirmación de eliminación del deck") 

class TopicDeckRequest(BaseModel):
    topic: str = Field(..., description="Tema principal del cual se derivarán los conceptos")
    prompt: PromptInstructions = Field(..., description="Prompt del sistema para generar tarjetas (no se usa en la expansión)")
    template: TemplateFields = Field(..., description="Template para definir campos de anverso y reverso")
