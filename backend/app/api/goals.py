from fastapi import APIRouter, HTTPException, Depends
from app.schemas.goal import GoalCreate, GoalContribute
from app.services.goal_service import (
    get_goals,
    create_goal,
    contribute_to_goal,
    delete_goal,
)
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/goals",
    tags=["Goals"],
)


@router.get("/")
def list_goals(user_id: str = Depends(get_current_user_id)):
    return get_goals(user_id)


@router.post("/")
def add_goal(
    goal: GoalCreate,
    user_id: str = Depends(get_current_user_id),
):
    return create_goal(user_id, goal.model_dump())


@router.post("/{goal_id}/contribute")
def add_contribution(
    goal_id: str,
    contrib: GoalContribute,
    user_id: str = Depends(get_current_user_id),
):
    updated = contribute_to_goal(user_id, goal_id, contrib.amount)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated


@router.delete("/{goal_id}")
def remove_goal(
    goal_id: str,
    user_id: str = Depends(get_current_user_id),
):
    delete_goal(user_id, goal_id)
    return {"message": "Goal deleted successfully"}
