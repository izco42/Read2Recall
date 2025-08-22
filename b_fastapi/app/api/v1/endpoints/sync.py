from fastapi import APIRouter, Depends
from auth.dependencies import get_authenticated_client
from services.sync_service import upload_deck_files , upload_deck_metadata,upload_templates, download_templates,download_deck_files
from schemas.sync_schemas import UploadSyncResponse, DownloadSyncResponse

router = APIRouter()

@router.post("/upload", response_model=UploadSyncResponse)
async def sync_upload_decks(auth=Depends(get_authenticated_client)):
    client, user_id = auth

    uploaded = upload_deck_files(client, user_id)
    upload_deck_metadata(client, user_id, uploaded)
    upload_templ = upload_templates(client, user_id)

    return {"status": "sync completed", 
            "uploaded_decks": uploaded, 
            "uploaded_templates": upload_templ["uploaded_templates"]}

@router.get("/download", response_model=DownloadSyncResponse)
async def sync_download_decks(
    auth=Depends(get_authenticated_client)
):
    client, user_id = auth
    downloaded = download_deck_files(client, user_id)
    downloaded_templates = download_templates(client, user_id)

    return {
        "status": "sync completed",
        "downloaded_decks": downloaded,
        "downloaded_templates": downloaded_templates["downloaded_templates"]
    }