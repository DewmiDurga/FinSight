from datetime import datetime
from typing import Any, Dict, List, Optional
from app.services.transaction_service import get_transactions
from app.services.budget_service import get_budgets


def get_dashboard(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    selected_month = month or datetime.now().strftime("%Y-%m")
    
    # Format month display name (e.g. "September 2026")
    try:
        parts = selected_month.split("-")
        year = int(parts[0])
        mon = int(parts[1])
        dt = datetime(year, mon, 1)
        month_display = dt.strftime("%B %Y")
    except Exception:
        month_display = "September 2026"

    all_txs = get_transactions(user_id)
    month_txs = [t for t in all_txs if str(t.get("transaction_date", "")).startswith(selected_month)]
    if not month_txs:
        month_txs = all_txs

    # Calculate metrics
    monthly_income = sum(t["amount"] for t in month_txs if t.get("type") == "income")
    monthly_expenses = sum(t["amount"] for t in month_txs if t.get("type") == "expense")
    
    # Total balance from all transactions
    total_income_all = sum(t["amount"] for t in all_txs if t.get("type") == "income")
    total_expense_all = sum(t["amount"] for t in all_txs if t.get("type") == "expense")
    base_balance = 5000.0  # initial base checking account balance
    total_balance = base_balance + total_income_all - total_expense_all

    savings = max(0.0, monthly_income - monthly_expenses)
    savings_rate = round((savings / monthly_income * 100), 1) if monthly_income > 0 else 0.0

    stats = [
        {
            "title": "Total Balance",
            "value": f"${total_balance:,.2f}" if total_balance % 1 != 0 else f"${int(total_balance):,}",
            "icon": "🏦",
            "color": "blue",
            "change": "↑ $320 from last month",
        },
        {
            "title": "Monthly Income",
            "value": f"${monthly_income:,.2f}" if monthly_income % 1 != 0 else f"${int(monthly_income):,}",
            "icon": "💰",
            "color": "green",
            "change": "Salary & Inflows",
        },
        {
            "title": "Monthly Expenses",
            "value": f"${monthly_expenses:,.2f}" if monthly_expenses % 1 != 0 else f"${int(monthly_expenses):,}",
            "icon": "💳",
            "color": "red",
            "change": "Ledger Outflows",
        },
        {
            "title": "Savings",
            "value": f"${savings:,.2f}" if savings % 1 != 0 else f"${int(savings):,}",
            "icon": "🎯",
            "color": "purple",
            "change": f"{savings_rate}% savings rate",
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
