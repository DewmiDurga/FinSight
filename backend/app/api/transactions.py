from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.transaction import TransactionCreate
from app.services.transaction_service import (
    get_transactions,
    create_transaction,
    delete_transaction,
    get_transaction_summary,
)

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/")
def list_transactions(
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    month: Optional[str] = Query(None, description="Filter by month: YYYY-MM"),
    date: Optional[str] = Query(None, description="Filter by exact day: YYYY-MM-DD"),
):
    return get_transactions(
        TEMP_USER_ID,
        filter_type=type,
        month=month,
        day_date=date,
    )


@router.get("/summary")
def transaction_summary(
    month: Optional[str] = Query(None, description="Filter summary by month: YYYY-MM"),
):
    return get_transaction_summary(TEMP_USER_ID, month=month)


@router.post("/")
def add_transaction(transaction: TransactionCreate):
    return create_transaction(
        TEMP_USER_ID,
        transaction.model_dump(),
    )


@router.delete("/{transaction_id}")
def remove_transaction(transaction_id: str):
    success = delete_transaction(TEMP_USER_ID, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}
