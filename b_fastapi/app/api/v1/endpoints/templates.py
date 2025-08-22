from fastapi import APIRouter, HTTPException
from schemas.template_schema import TemplateCreateRequest, TemplateResponse, TemplateDeleteRequest , TemplateDeleteResponse
from services.templates_service import (
    create_template_file,
    delete_template_file,
    list_all_templates
)

router = APIRouter()

@router.post("/create/", response_model=TemplateResponse)
async def create_template(request: TemplateCreateRequest):
    return create_template_file(request)


@router.delete("/delete/",response_model=TemplateDeleteResponse)
async def delete_template(request: TemplateDeleteRequest):
    success = delete_template_file(request.template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return {"message": f"Template {request.template_id} deleted successfully."}


@router.get("/list/", response_model=list[TemplateResponse])
async def list_templates():
    return list_all_templates()
