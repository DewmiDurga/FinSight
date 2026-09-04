from typing import Literal, Optional
from pydantic import BaseModel


class LoanCreate(BaseModel):
    loan_direction: Literal["given", "got"]
    person: str
    amount: float
    type: Optional[str] = "Cash"
    date: str
    next_settlement: Optional[str] = None
    return_date: Optional[str] = None
    interest_rate: Optional[float] = 0.0
    notes: Optional[str] = ""


class LoanSettle(BaseModel):
    amount: float


class LoanResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    loan_direction: str
    person: str
    amount: float
    type: str
    date: str
    next_settlement: Optional[str] = None
    return_date: Optional[str] = None
    interest_rate: float
    notes: str
    settled: bool
    settled_amount: float
    created_at: Optional[str] = None
