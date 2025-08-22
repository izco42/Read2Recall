from pydantic import BaseModel, Field
from typing import Dict, List

class UploadSyncResponse(BaseModel):
    status: str = Field(...,description="El estado final de la operación de sincronización.",examples=["sync completed"])
    uploaded_decks: Dict[str, str] = Field(...,description="Un diccionario que mapea la ruta del archivo del mazo local a su ID de archivo en el bucket de Appwrite.")
    uploaded_templates: List[str] = Field(...,description="Una lista con los IDs de las plantillas que fueron subidas.")
    
class DownloadSyncResponse(BaseModel):
    status: str = Field(...,description="El estado final de la operación de sincronización.",examples=["sync completed"])
    downloaded_decks: List[str] = Field(...,description="Una lista con los IDs de los mazos que fueron descargados.")
    downloaded_templates: List[str] = Field(...,description="Una lista con los IDs de las plantillas que fueron descargadas.")