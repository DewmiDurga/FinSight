from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas.loan import LoanCreate, LoanSettle
from app.services.loan_service import (
    get_loans,
    create_loan,
    settle_loan,
    reset_loan_settlement,
    delete_loan,
    calculate_amortization_schedule,
    get_loan_amortization,
)
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/loans",
    tags=["Loans"],
)


@router.get("/")
def list_loans(
    direction: Optional[str] = Query(None, description="Filter direction: 'given' or 'got'"),
    user_id: str = Depends(get_current_user_id),
):
    return get_loans(user_id, loan_direction=direction)


@router.get("/calculator/amortization")
def calculate_hypothetical_amortization(
    principal: float = Query(..., description="Loan principal amount", gt=0),
    rate: float = Query(..., description="Annual interest rate percentage", ge=0),
    months: int = Query(12, description="Loan tenure in months", gt=0, le=360),
):
    """NumPy-powered loan amortization schedule calculator."""
    return calculate_amortization_schedule(principal=principal, annual_rate_pct=rate, tenure_months=months)


@router.get("/{loan_id}/amortization")
def loan_amortization(
    loan_id: str,
    months: Optional[int] = Query(None, description="Optional tenure months override", gt=0, le=360),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve full amortization schedule for an existing loan."""
    schedule = get_loan_amortization(user_id, loan_id, tenure_months=months)
    if not schedule:
        raise HTTPException(status_code=404, detail="Loan not found")
    return schedule


@router.post("/")
def add_loan(
    loan: LoanCreate,
    user_id: str = Depends(get_current_user_id),
):
    return create_loan(user_id, loan.model_dump())


@router.post("/{loan_id}/settle")
def apply_settlement(
    loan_id: str,
    payload: LoanSettle,
    user_id: str = Depends(get_current_user_id),
):
    updated = settle_loan(user_id, loan_id, payload.amount)
    if not updated:
        raise HTTPException(status_code=404, detail="Loan not found")
    return updated


@router.post("/{loan_id}/reset-settlement")
def reset_settlement(
    loan_id: str,
    user_id: str = Depends(get_current_user_id),
):
    updated = reset_loan_settlement(user_id, loan_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Loan not found")
    return updated


@router.delete("/{loan_id}")
def remove_loan(
    loan_id: str,
    user_id: str = Depends(get_current_user_id),
):
    delete_loan(user_id, loan_id)
    return {"message": "Loan deleted successfully"}
