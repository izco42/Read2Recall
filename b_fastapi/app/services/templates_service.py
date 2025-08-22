from schemas.template_schema import TemplateCreateRequest, TemplateResponse
from pathlib import Path
import json
import uuid

TEMPLATE_DIR = Path("/app/templates")
TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

def create_template_file(data: TemplateCreateRequest) -> TemplateResponse:
    template_id = uuid.uuid4().int >> 96  
    template_data = {
        "template_id": template_id,
        "template_name": data.template_name,
        "front": data.front,
        "back": data.back
    }
    
    filepath = TEMPLATE_DIR / f"{template_id}.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(template_data, f, ensure_ascii=False, indent=2)

    return TemplateResponse(**template_data)

def delete_template_file(template_id: int) -> bool:
    filepath = TEMPLATE_DIR / f"{template_id}.json"
    if filepath.exists():
        filepath.unlink()
        return True
    return False

def list_all_templates() -> list[TemplateResponse]:
    templates = []
    for file in TEMPLATE_DIR.glob("*.json"):
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)
                templates.append(TemplateResponse(**data))
        except Exception:
            continue  
    return templates
