from pydantic import BaseModel, Field
from typing import List, Optional

class Message(BaseModel):
    role: str = Field(..., description="Role of the message sender, e.g., 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")

class LLMRequest(BaseModel):
    messages: List[Message] = Field(..., description="List of messages in the conversation")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature for the model")
    max_tokens: Optional[int] = Field(1000, description="Maximum number of tokens in the response") 

class LLMResponse(BaseModel):
    response: str = Field(..., description="Response from the language model")

