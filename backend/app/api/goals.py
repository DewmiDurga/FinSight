from fastapi import APIRouter, HTTPException
from app.schemas.goal import GoalCreate, GoalContribute
from app.services.goal_service import (
    get_goals,
    create_goal,
    contribute_to_goal,
    delete_goal,
)

router = APIRouter(
    prefix="/goals",
    tags=["Goals"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/")
def list_goals():
    return get_goals(TEMP_USER_ID)


@router.post("/")
def add_goal(goal: GoalCreate):
    return create_goal(TEMP_USER_ID, goal.model_dump())


@router.post("/{goal_id}/contribute")
def add_contribution(goal_id: str, contrib: GoalContribute):
    updated = contribute_to_goal(TEMP_USER_ID, goal_id, contrib.amount)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated


@router.delete("/{goal_id}")
def remove_goal(goal_id: str):
    delete_goal(TEMP_USER_ID, goal_id)
    return {"message": "Goal deleted successfully"}
