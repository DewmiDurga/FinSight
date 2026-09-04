from typing import Optional
from fastapi import APIRouter, Query
from app.services.analytics_service import get_analytics

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/overview")
def analytics_overview(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
):
    return get_analytics(TEMP_USER_ID, month=month)
