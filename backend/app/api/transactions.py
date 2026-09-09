from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas.transaction import TransactionCreate
from app.services.transaction_service import (
    get_transactions,
    create_transaction,
    delete_transaction,
    get_transaction_summary,
)
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.get("/")
def list_transactions(
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    month: Optional[str] = Query(None, description="Filter by month: YYYY-MM"),
    date: Optional[str] = Query(None, description="Filter by exact day: YYYY-MM-DD"),
    user_id: str = Depends(get_current_user_id),
):
    return get_transactions(
        user_id,
        filter_type=type,
        month=month,
        day_date=date,
    )


@router.get("/summary")
def transaction_summary(
    month: Optional[str] = Query(None, description="Filter summary by month: YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    return get_transaction_summary(user_id, month=month)


@router.post("/")
def add_transaction(
    transaction: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
):
    return create_transaction(
        user_id,
        transaction.model_dump(),
    )


@router.delete("/{transaction_id}")
def remove_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id),
):
    success = delete_transaction(user_id, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}
