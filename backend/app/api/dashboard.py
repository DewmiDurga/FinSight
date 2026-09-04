from typing import Optional
from fastapi import APIRouter, Query
from app.services.dashboard_service import get_dashboard

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

TEMP_USER_ID = "00000000-0000-0000-0000-000000000000"


@router.get("/")
def dashboard_data(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
):
    return get_dashboard(TEMP_USER_ID, month=month)
