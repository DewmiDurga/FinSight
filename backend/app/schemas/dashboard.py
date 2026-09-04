from typing import List, Optional
from pydantic import BaseModel
from app.schemas.transaction import TransactionResponse
from app.schemas.budget import BudgetResponse


class StatItem(BaseModel):
    title: str
    value: str
    icon: str
    color: str
    change: str


class DashboardResponse(BaseModel):
    month_display: str
    stats: List[StatItem]
    recent_transactions: List[TransactionResponse]
    budget_status: List[BudgetResponse]
