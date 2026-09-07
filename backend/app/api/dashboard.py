from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.services.dashboard_service import get_dashboard
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard_data(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    return get_dashboard(user_id, month=month)
