import os
import httpx
from schemas.llm_schema import LLMRequest, LLMResponse

MODEL_HOST = os.getenv("MODEL_HOST")
LMSTUDIO_URL = f"{MODEL_HOST}/v1/chat/completions"

async def query_llm(data: LLMRequest) -> LLMResponse:
    payload = {
        "model": "",  
        "messages": [msg.dict() for msg in data.messages],
        "temperature": data.temperature,
        "max_tokens": data.max_tokens,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(LMSTUDIO_URL, json=payload)

    if response.status_code != 200:
        raise Exception(f"LM Studio error: {response.text}")

    content = response.json()["choices"][0]["message"]["content"]
    return LLMResponse(response=content)
