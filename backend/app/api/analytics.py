from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.services.analytics_service import get_analytics
from app.auth import get_current_user_id

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/overview")
def analytics_overview(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    return get_analytics(user_id, month=month)
