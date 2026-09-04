from typing import Optional
from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    icon: Optional[str] = "📦"
    color: Optional[str] = "#6366f1"
    bg_color: Optional[str] = "#ede9fe"


class BudgetUpdate(BaseModel):
    category: Optional[str] = None
    limit_amount: Optional[float] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    bg_color: Optional[str] = None


class BudgetResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    category: str
    limit: float
    spent: float
    icon: str
    color: str
    bg_color: str
    created_at: Optional[str] = None
