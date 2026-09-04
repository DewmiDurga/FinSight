from typing import List, Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    role: str = "assistant"
    text: str
    timestamp: str
    suggestions: Optional[List[str]] = None
