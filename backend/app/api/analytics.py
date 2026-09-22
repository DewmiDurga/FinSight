from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.services.analytics_service import (
    get_analytics,
    get_spending_insights,
    detect_spending_anomalies,
    forecast_month_end_expense,
)
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
    """Retrieve full analytics overview (income, expenses, category breakdown, 6-month trends)."""
    return get_analytics(user_id, month=month)


@router.get("/insights")
def analytics_insights(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    """Retrieve predictive month-end forecast and detected spending anomalies."""
    return get_spending_insights(user_id, month=month)


@router.get("/anomalies")
def analytics_anomalies(
    threshold: float = Query(2.0, description="Z-score standard deviation threshold"),
    user_id: str = Depends(get_current_user_id),
):
    """Detect unusual expense spikes using NumPy Z-scores."""
    return detect_spending_anomalies(user_id, threshold_std=threshold)


@router.get("/forecast")
def analytics_forecast(
    month: Optional[str] = Query(None, description="Month YYYY-MM"),
    user_id: str = Depends(get_current_user_id),
):
    """Get month-end expense projection based on daily spend velocity."""
    return forecast_month_end_expense(user_id, month=month)
