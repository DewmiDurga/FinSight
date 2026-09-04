from fastapi import APIRouter
from app.schemas.assistant import ChatRequest
from app.services.assistant_service import generate_reply

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.post("/chat")
def chat_with_assistant(req: ChatRequest):
    return generate_reply(TEMP_USER_ID, req.message)
