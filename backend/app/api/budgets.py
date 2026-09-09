from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.budget_service import (
    get_budgets,
    create_budget,
    update_budget,
    delete_budget,
)
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"],
)


@router.get("/")
def list_budgets(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    return get_budgets(user_id, month=month)


@router.post("/")
def add_budget(
    budget: BudgetCreate,
    user_id: str = Depends(get_current_user_id),
):
    return create_budget(user_id, budget.model_dump())


@router.put("/{budget_id}")
def edit_budget(
    budget_id: str,
    budget: BudgetUpdate,
    user_id: str = Depends(get_current_user_id),
):
    updated = update_budget(user_id, budget_id, budget.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Budget not found")
    return updated


@router.delete("/{budget_id}")
def remove_budget(
    budget_id: str,
    user_id: str = Depends(get_current_user_id),
):
    delete_budget(user_id, budget_id)
    return {"message": "Budget deleted successfully"}
