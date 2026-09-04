from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel


class TransactionBase(BaseModel):
    description: str
    amount: float
    type: Literal["income", "expense"]
    category: str
    account: Optional[str] = "Main Checking"
    transaction_date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    user_id: Optional[str] = None
    created_at: Optional[str] = None
