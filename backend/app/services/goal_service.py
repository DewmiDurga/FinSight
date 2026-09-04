from typing import Any, Dict, List, Optional
from app.db import ResilientDB


def get_goals(user_id: str) -> List[Dict[str, Any]]:
    goals = ResilientDB.select("goals", user_id, order_col="created_at", desc=False)
    return [
        {
            "id": str(g.get("id")),
            "user_id": g.get("user_id"),
            "name": g.get("name"),
            "target": float(g.get("target") or 0.0),
            "saved": float(g.get("saved") or 0.0),
            "icon": g.get("icon") or "🎯",
            "color": g.get("color") or "#6366f1",
            "bg_color": g.get("bg_color") or "#ede9fe",
            "deadline": g.get("deadline") or "No deadline",
            "created_at": g.get("created_at"),
        }
        for g in goals
    ]


def create_goal(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    row = {
        "user_id": user_id,
        "name": data["name"],
        "target": float(data["target"]),
        "saved": 0.0,
        "icon": data.get("icon", "🎯"),
        "color": data.get("color", "#6366f1"),
        "bg_color": data.get("bg_color", "#ede9fe"),
        "deadline": data.get("deadline", "No deadline"),
    }
    created = ResilientDB.insert("goals", row)
    return {
        "id": str(created.get("id")),
        "user_id": created.get("user_id"),
        "name": created.get("name"),
        "target": float(created.get("target") or 0.0),
        "saved": float(created.get("saved") or 0.0),
        "icon": created.get("icon"),
        "color": created.get("color"),
        "bg_color": created.get("bg_color"),
        "deadline": created.get("deadline"),
        "created_at": created.get("created_at"),
    }


def contribute_to_goal(user_id: str, goal_id: str, amount: float) -> Optional[Dict[str, Any]]:
    goals = ResilientDB.select("goals", user_id)
    target_goal = next((g for g in goals if str(g.get("id")) == str(goal_id)), None)
    if not target_goal:
        return None

    current_saved = float(target_goal.get("saved") or 0.0)
    target_amount = float(target_goal.get("target") or 0.0)
    new_saved = min(target_amount, current_saved + amount)

    updated = ResilientDB.update("goals", goal_id, {"saved": new_saved})
    if not updated:
        return None

    return {
        "id": str(updated.get("id")),
        "user_id": updated.get("user_id"),
        "name": updated.get("name"),
        "target": float(updated.get("target") or 0.0),
        "saved": float(updated.get("saved") or 0.0),
        "icon": updated.get("icon"),
        "color": updated.get("color"),
        "bg_color": updated.get("bg_color"),
        "deadline": updated.get("deadline"),
        "created_at": updated.get("created_at"),
    }


def delete_goal(user_id: str, goal_id: str) -> bool:
    return ResilientDB.delete("goals", goal_id)
