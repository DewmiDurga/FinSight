from datetime import datetime
from typing import Any, Dict, List, Optional
from app.services.transaction_service import get_transactions
from app.services.budget_service import get_budgets
from app.services.goal_service import get_goals


def format_currency(val: float) -> str:
    sign = "-" if val < 0 else ""
    abs_val = abs(val)
    if abs_val % 1 != 0:
        return f"{sign}${abs_val:,.2f}"
    return f"{sign}${int(abs_val):,}"


def get_dashboard(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    selected_month = month or datetime.now().strftime("%Y-%m")
    
    # Format month display name
    try:
        parts = selected_month.split("-")
        year = int(parts[0])
        mon = int(parts[1])
        dt = datetime(year, mon, 1)
        month_display = dt.strftime("%B %Y")
    except Exception:
        month_display = datetime.now().strftime("%B %Y")

    all_txs = get_transactions(user_id)
    all_goals = get_goals(user_id)

    # Core dashboard calculations requested:
    # expenses in dashboard = total expenses in transaction table
    # income in dashboard = total income in transaction table
    # saving = total saved in goals
    # balance in dashboard = total income - total expenses + total saving
    total_income = sum(float(t.get("amount") or 0.0) for t in all_txs if t.get("type") == "income")
    total_expenses = sum(float(t.get("amount") or 0.0) for t in all_txs if t.get("type") == "expense")
    total_saved = sum(float(g.get("saved") or 0.0) for g in all_goals)
    total_balance = total_income - total_expenses + total_saved

    stats = [
        {
            "title": "Total Balance",
            "value": format_currency(total_balance),
            "icon": "🏦",
            "color": "blue",
            "change": "Income − Expenses + Savings",
        },
        {
            "title": "Monthly Income",
            "value": format_currency(total_income),
            "icon": "💰",
            "color": "green",
            "change": "Total Inflows",
        },
        {
            "title": "Monthly Expenses",
            "value": format_currency(total_expenses),
            "icon": "💳",
            "color": "red",
            "change": "Total Outflows",
        },
        {
            "title": "Savings",
            "value": format_currency(total_saved),
            "icon": "🎯",
            "color": "purple",
            "change": "Total Saved in Goals",
        },
    ]

    # Recent transactions (top 4)
    recent_transactions = all_txs[:4]

    # Budget status
    budget_status = get_budgets(user_id, month=selected_month)

    return {
        "month_display": month_display,
        "stats": stats,
        "recent_transactions": recent_transactions,
        "budget_status": budget_status,
    }
