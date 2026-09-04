from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.budget_service import (
    get_budgets,
    create_budget,
    update_budget,
    delete_budget,
)

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/")
def list_budgets(month: Optional[str] = Query(None, description="Month YYYY-MM")):
    return get_budgets(TEMP_USER_ID, month=month)


@router.post("/")
def add_budget(budget: BudgetCreate):
    return create_budget(TEMP_USER_ID, budget.model_dump())


@router.put("/{budget_id}")
def edit_budget(budget_id: str, budget: BudgetUpdate):
    updated = update_budget(TEMP_USER_ID, budget_id, budget.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Budget not found")
    return updated


@router.delete("/{budget_id}")
def remove_budget(budget_id: str):
    delete_budget(TEMP_USER_ID, budget_id)
    return {"message": "Budget deleted successfully"}
