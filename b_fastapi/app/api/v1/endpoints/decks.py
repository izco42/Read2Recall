from fastapi import APIRouter, UploadFile, File, Form , HTTPException 
from fastapi.responses import JSONResponse
from pydantic import TypeAdapter 
# from services.chunking import chunk_text
from schemas.decks_schema import CreateDeckRequest, TemplateFields, PromptInstructions ,Flashcard, ConfirmDeckRequest, DeckCreationResult , DeckDeleteRequest , DeckDeleteResponse, TopicDeckRequest 
from services.decks_service import process_deck_creation , build_topic_blueprint , flesh_out_concept , process_deck_creation_topic
from services.deck_creator import create_deck_from_request, list_deck_metadata , delete_deck_by_id 
from typing import List

router = APIRouter()
schemasRouter = APIRouter()

@router.post("/create/",response_model=List[Flashcard])   
async def generate_cards(
    Create_Deck_Request: str = Form(...),
    pdf_file: UploadFile = File(...)
):
    try:
        data = TypeAdapter(CreateDeckRequest).validate_json(Create_Deck_Request)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": f"Invalid JSON structure: {str(e)}"})

    try:
        flashcards = await process_deck_creation(
            pdf_file=pdf_file,
            template=data.template,
            prompt=data.prompt
    )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return flashcards

@router.post("/create-from-topic/", response_model=List[Flashcard]) 
async def create_deck_from_topic(request: TopicDeckRequest):
    try:
        blueprint_prompt = PromptInstructions(
            system_prompt= "Actúa como un experto académico. Tu tarea es generar un esquema maestro con los fundamentos esenciales,  estructuras y temas clave que constituyen el núcleo del tópico proporcionado. Sé riguroso, preciso y exhaustivo.",
            temperature= 0.3,
            max_tokens=512
        )  

        blueprint_text = await build_topic_blueprint(request.topic, blueprint_prompt)
        # chunks = chunk_text(blueprint_text)
        chunks = [line.strip() for line in blueprint_text.split('\n') if line.strip()] 
        if not chunks:
            raise HTTPException(status_code=400, detail="No se generaron conceptos a partir del tema proporcionado.")
       

        expanded_concepts = [] 

        flesh_out_prompt= PromptInstructions(
            system_prompt= "Desarrolla en profundidad el siguiente concepto clave como si estuvieras escribiendo un capítulo académico. Explícalo con claridad, detalle y precisión, de forma estructurada y comprensible para estudiantes avanzados.",
            temperature= 0.4,
            max_tokens= 512 
        )

        for idx, chunk in enumerate(chunks):
            try:
                concept_expansion = await flesh_out_concept(chunk, flesh_out_prompt)
                expanded_concepts.append(concept_expansion.strip())
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error al expandir el concepto {idx+1}: {str(e)}")

        if not expanded_concepts:
            raise HTTPException(status_code=400, detail="No se generaron conceptos expandidos a partir del tema proporcionado.")
        
        try:
             flashcards = await process_deck_creation_topic(
                chunks=expanded_concepts,
                template=request.template,
                prompt=request.prompt)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al procesar la creación del mazo: {str(e)}")

        return flashcards

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
   



@router.post("/confirm/",response_model=DeckCreationResult) 
async def confirm_deck(request: ConfirmDeckRequest): 
    result = create_deck_from_request(request)
    return result


@router.get("/list/", response_model=List[DeckCreationResult])
async def list_metadata():
    return list_deck_metadata()

@router.delete("/delete/" , response_model=DeckDeleteResponse)
async def delete_deck(request: DeckDeleteRequest):
    success = delete_deck_by_id(request.deck_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deck or metadata not found.")
    return {"message": f"Deck {request.deck_id} and metadata deleted successfully."}


@schemasRouter.get("/schemas/create-deck/", response_model=CreateDeckRequest)
async def show_create_deck_schema():
    return {
        "template": {
            "template_name": "Ejemplo de template",
            "template_id": 123456789,
            "front": ["ejemplo_pregunta", "ejemplo_concepto"],
            "back": ["ejemplo_explicación", "ejemplo_referencias"]
        },
        "prompt": {
            "system_prompt": "Ejemplo de prompt",
            "temperature": 0.5,
            "max_tokens": 2048
        }
    }

@schemasRouter.get("/schemas/prompt-instructions/", response_model=PromptInstructions)
async def show_prompt_instructions_schema():
    return {
        "system_prompt": "Ejemplo de prompt",
        "temperature": 0.5,
        "max_tokens": 2048
    }

@schemasRouter.get("/schemas/template-fields/", response_model=TemplateFields)
async def show_template_fields_schema():
    return {
        "template_name": "Ejemplo de template",
        "template_id": 123456789,
        "front": ["ejemplo_pregunta", "ejemplo_concepto"],
        "back": ["ejemplo_explicación", "ejemplo_referencias"]
    }    
