from typing import Optional
from pydantic import BaseModel


class GoalCreate(BaseModel):
    name: str
    target: float
    icon: Optional[str] = "🎯"
    color: Optional[str] = "#6366f1"
    bg_color: Optional[str] = "#ede9fe"
    deadline: Optional[str] = "No deadline"


class GoalContribute(BaseModel):
    amount: float


class GoalResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    target: float
    saved: float
    icon: str
    color: str
    bg_color: str
    deadline: str
    created_at: Optional[str] = None
