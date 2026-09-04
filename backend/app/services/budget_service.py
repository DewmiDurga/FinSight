from datetime import datetime
from typing import Any, Dict, List, Optional
from app.db import ResilientDB
from app.services.transaction_service import get_transactions


def get_budgets(user_id: str, month: Optional[str] = None) -> List[Dict[str, Any]]:
    budgets = ResilientDB.select("budgets", user_id, order_col="created_at", desc=False)
    
    # Calculate live spent from transactions
    current_month = month or datetime.now().strftime("%Y-%m")
    txs = get_transactions(user_id, filter_type="expense", month=current_month)

    category_spend: Dict[str, float] = {}
    for tx in txs:
        cat = tx.get("category", "")
        category_spend[cat] = category_spend.get(cat, 0.0) + float(tx.get("amount", 0.0))

    result = []
    for b in budgets:
        cat = b.get("category", "")
        # Live spend if any transactions found, else stored spent_amount
        spent = category_spend.get(cat, float(b.get("spent_amount") or 0.0))
        result.append({
            "id": str(b.get("id")),
            "user_id": b.get("user_id"),
            "category": cat,
            "limit": float(b.get("limit_amount") or 0.0),
            "spent": round(spent, 2),
            "icon": b.get("icon") or "📦",
            "color": b.get("color") or "#6366f1",
            "bg_color": b.get("bg_color") or "#ede9fe",
            "created_at": b.get("created_at"),
        })

    return result


def create_budget(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    row = {
        "user_id": user_id,
        "category": data["category"],
        "limit_amount": data["limit_amount"],
        "spent_amount": 0.0,
        "icon": data.get("icon", "📦"),
        "color": data.get("color", "#6366f1"),
        "bg_color": data.get("bg_color", "#ede9fe"),
    }
    created = ResilientDB.insert("budgets", row)
    return {
        "id": str(created.get("id")),
        "user_id": created.get("user_id"),
        "category": created.get("category"),
        "limit": float(created.get("limit_amount") or 0.0),
        "spent": float(created.get("spent_amount") or 0.0),
        "icon": created.get("icon"),
        "color": created.get("color"),
        "bg_color": created.get("bg_color"),
        "created_at": created.get("created_at"),
    }


def update_budget(user_id: str, budget_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    clean_data = {k: v for k, v in data.items() if v is not None}
    if "limit" in clean_data and "limit_amount" not in clean_data:
        clean_data["limit_amount"] = clean_data.pop("limit")

    updated = ResilientDB.update("budgets", budget_id, clean_data)
    if not updated:
        return None

    return {
        "id": str(updated.get("id")),
        "user_id": updated.get("user_id"),
        "category": updated.get("category"),
        "limit": float(updated.get("limit_amount") or 0.0),
        "spent": float(updated.get("spent_amount") or 0.0),
        "icon": updated.get("icon"),
        "color": updated.get("color"),
        "bg_color": updated.get("bg_color"),
        "created_at": updated.get("created_at"),
    }


def delete_budget(user_id: str, budget_id: str) -> bool:
    return ResilientDB.delete("budgets", budget_id)
