from schemas.decks_schema import TemplateFields, PromptInstructions,Flashcard 
from schemas.llm_schema   import LLMRequest, LLMResponse, Message 
from services.chunking import extract_text_from_pdf,chunk_text
from pydantic import ValidationError
from services.llm_service import query_llm  
from fastapi import UploadFile
import re
import json

def extract_valid_json(text: str) -> list | dict:
    matches = re.findall(r'\[\s*{[\s\S]*?}\s*]', text)
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    raise ValueError("No valid JSON found in response.")


def sanitize_flashcards(raw_cards):
   
    sanitized = []
    temp_card = {}

    for item in raw_cards:
        if 'campos_anverso' in item:
            temp_card['campos_anverso'] = item['campos_anverso']
        elif 'campo_reverso' in item:
            temp_card['campo_reverso'] = item['campo_reverso']

        if 'campos_anverso' in temp_card and 'campo_reverso' in temp_card:
            try:
                card = Flashcard(**temp_card)
                sanitized.append(card)
            except ValidationError:
                pass  
            temp_card = {}  

    return sanitized

async def generate_flashcards_from_chunk(
    chunk: str,
    template: TemplateFields,
    prompt: PromptInstructions
):
    system_prompt = prompt.system_prompt.strip()

    template_description = f"""
    Genera  AL MENOS UNA tarjeta en formato JSON para Anki a partir del texto dado.

    Cada tarjeta debe ser un objeto JSON que contenga EXACTAMENTE los siguientes campos: 

    - "campos_anverso": {template.front}

    - "campo_reverso": {template.back}

    IMPORTANTE:
    - Cada elemento de la lista debe ser una cadena de texto (string).
    - El contenido debe ser estrictamente un JSON válido. No agregues explicaciones ni comentarios fuera del JSON NUNCA.
    - SOLO RETORNA EL JSON, sin ningún otro texto o explicación adicional.
    """
    user_prompt = f"""
    TEXTO EXTRAÍDO:
    {chunk}
    INSTRUCCIONES:
    {template_description}
    """

    llm_request  = LLMRequest(
        temperature=prompt.temperature,
        max_tokens=prompt.max_tokens,
        messages=[
            Message(role="system", content=system_prompt),
            Message(role="user", content=user_prompt),
        ]
    )

    response : LLMResponse = await query_llm(llm_request)
    print(f"Respuesta del modelo: {response.response}")
    return response.response


async def process_deck_creation(
    pdf_file: UploadFile,
    template: TemplateFields,
    prompt: PromptInstructions
):
    extracted_text = await extract_text_from_pdf(pdf_file)
    if not extracted_text:
        raise ValueError("No text extracted from PDF.")

    chunks = chunk_text(extracted_text)
    if not chunks:
        raise ValueError("No valid text chunks found.")

    all_cards = []
    for idx, chunk in enumerate(chunks):
        print(f"Procesando chunk {idx + 1}/{len(chunks)}")
        try:
            response_text = await generate_flashcards_from_chunk(chunk, template, prompt)
            parsed_cards = extract_valid_json(response_text)
            all_cards.extend(parsed_cards)
        except Exception as e:
            print(f"⚠️ Chunk {idx + 1} descartado por error: {e}")
            continue  # ignorar el chunk y pasar al siguiente

    return all_cards


async def build_topic_blueprint(topic : str , prompt : PromptInstructions) -> str:
    topic = topic.strip()
     
    user_prompt = f"""
Eres un experto en el área del conocimiento con amplia experiencia enseñando y desglosando temas complejos.

Tu tarea es crear un esquema maestro profundo y jerárquico del tema: "{topic}".

Este esquema debe cubrir los fundamentos, conceptos clave, pilares, y relaciones esenciales que forman la piedra angular para entender a fondo este tema.

El esquema debe estar organizado de forma clara y lógica, como un mapa mental o índice detallado, resaltando los elementos fundamentales que sostienen todo el conocimiento relacionado.

No incluyas explicaciones, solo el esquema en texto, estructurado para que luego pueda ser desarrollado en contenido detallado.
    """.strip()
 
    llm_request = LLMRequest(
        temperature=prompt.temperature,
        max_tokens=prompt.max_tokens,
        messages=[
            Message(role="system", content=prompt.system_prompt.strip()),
            Message(role="user", content=user_prompt),
        ]
    )

    response: LLMResponse = await query_llm(llm_request)

    return response.response


async def flesh_out_concept( topic: str, prompt: PromptInstructions):

    
    user_prompt = f"""
    Eres un experto en el área y un excelente divulgador.

    Tu tarea es desarrollar de forma detallada y profunda el siguiente concepto o punto del esquema temático:

    "{topic.strip()}"

    Debes explicar:
    - Su definición y propósito.
    - Por qué es importante.
    - Sus componentes o elementos clave.
    - Ejemplos concretos o aplicaciones.
    - Cómo se relaciona con otros puntos del tema principal si corresponde.

    Escribe de forma clara, coherente y bien estructurada. Dirígete a una audiencia interesada en aprender a fondo, sin simplificaciones excesivas.
    """

    llm_request = LLMRequest(
        temperature=prompt.temperature,
        max_tokens=prompt.max_tokens,
        messages=[
            Message(role="system", content=prompt.system_prompt.strip()),
            Message(role="user", content=user_prompt.strip()),
        ]
    )

    response: LLMResponse = await query_llm(llm_request)

    return response.response

async def process_deck_creation_topic(
    chunks: list[str],
    template: TemplateFields,
    prompt: PromptInstructions
):
    if not chunks:
        raise ValueError("No valid text chunks found.")

    all_cards = []
    for idx, chunk in enumerate(chunks):
        print(f"Procesando concepto {idx + 1}/{len(chunks)}")
        try:
            response_text = await generate_flashcards_from_chunk(chunk, template, prompt)
            parsed_cards = extract_valid_json(response_text)
            
            cards = sanitize_flashcards(parsed_cards)

            all_cards.extend(cards)

        except Exception as e:
            print(f"⚠️ Concepto {idx + 1} descartado por error: {e}")
            continue  # ignorar el concepto y pasar al siguiente

    return all_cards
    
