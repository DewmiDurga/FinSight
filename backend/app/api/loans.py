from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.loan import LoanCreate, LoanSettle
from app.services.loan_service import (
    get_loans,
    create_loan,
    settle_loan,
    reset_loan_settlement,
    delete_loan,
)

router = APIRouter(
    prefix="/loans",
    tags=["Loans"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/")
def list_loans(
    direction: Optional[str] = Query(None, description="Filter direction: 'given' or 'got'"),
):
    return get_loans(TEMP_USER_ID, loan_direction=direction)


@router.post("/")
def add_loan(loan: LoanCreate):
    return create_loan(TEMP_USER_ID, loan.model_dump())


@router.post("/{loan_id}/settle")
def apply_settlement(loan_id: str, payload: LoanSettle):
    updated = settle_loan(TEMP_USER_ID, loan_id, payload.amount)
    if not updated:
        raise HTTPException(status_code=404, detail="Loan not found")
    return updated


@router.post("/{loan_id}/reset-settlement")
def reset_settlement(loan_id: str):
    updated = reset_loan_settlement(TEMP_USER_ID, loan_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Loan not found")
    return updated


@router.delete("/{loan_id}")
def remove_loan(loan_id: str):
    delete_loan(TEMP_USER_ID, loan_id)
    return {"message": "Loan deleted successfully"}
