from fastapi import APIRouter, Depends
from app.schemas.assistant import ChatRequest
from app.services.assistant_service import generate_reply
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"],
)


@router.post("/chat")
def chat_with_assistant(
    req: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    return generate_reply(user_id, req.message)
