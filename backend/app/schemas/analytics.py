from typing import List, Optional
from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str
    icon: str


class MonthlyTrendItem(BaseModel):
    month: str
    income: float
    expense: float


class TopMerchantItem(BaseModel):
    merchant: str
    amount: float
    category: str


class AnalyticsOverviewResponse(BaseModel):
    monthly_income: float
    total_expenses: float
    net_savings: float
    savings_rate: int
    biggest_spend_category: str
    biggest_spend_amount: float
    breakdown: List[CategoryBreakdownItem]
    monthly_trends: List[MonthlyTrendItem]
