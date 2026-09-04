from typing import Any, Dict, List, Optional
from app.db import ResilientDB


def get_transactions(
    user_id: str,
    filter_type: Optional[str] = None,
    month: Optional[str] = None,
    day_date: Optional[str] = None,
) -> List[Dict[str, Any]]:
    rows = ResilientDB.select("transactions", user_id, order_col="transaction_date", desc=True)

    # Filter in memory
    filtered = []
    for r in rows:
        t_type = r.get("type")
        t_date = str(r.get("transaction_date", ""))

        if filter_type and filter_type != "all" and t_type != filter_type:
            continue
        if day_date and t_date != day_date:
            continue
        if month and not t_date.startswith(month):
            continue
        filtered.append(r)

    return filtered


def create_transaction(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    row = {
        **data,
        "user_id": user_id,
    }
    return ResilientDB.insert("transactions", row)


def delete_transaction(user_id: str, transaction_id: str) -> bool:
    return ResilientDB.delete("transactions", transaction_id)


def get_transaction_summary(user_id: str, month: Optional[str] = None) -> Dict[str, float]:
    txs = get_transactions(user_id, month=month)
    total_income = sum(t["amount"] for t in txs if t["type"] == "income")
    total_expense = sum(t["amount"] for t in txs if t["type"] == "expense")
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_balance": total_income - total_expense,
    }
