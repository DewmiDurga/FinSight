from typing import Any, Dict, List, Optional
import numpy as np
from app.db import ResilientDB


def calculate_total_due(principal: float, monthly_rate_pct: float) -> float:
    interest = (principal * (monthly_rate_pct or 0.0)) / 100.0
    return principal + interest


def calculate_amortization_schedule(
    principal: float,
    annual_rate_pct: float,
    tenure_months: int = 12,
) -> Dict[str, Any]:
    """Calculate monthly loan amortization schedule using NumPy vectorized formulas."""
    tenure = max(1, int(tenure_months))
    p = float(principal)
    annual_r = float(annual_rate_pct or 0.0)

    if annual_r <= 0.0:
        monthly_payment = p / tenure
        schedule = []
        bal = p
        for period in range(1, tenure + 1):
            bal = max(0.0, bal - monthly_payment)
            schedule.append({
                "period": period,
                "payment": round(float(monthly_payment), 2),
                "principal_paid": round(float(monthly_payment), 2),
                "interest_paid": 0.0,
                "remaining_balance": round(float(bal), 2),
            })
        return {
            "principal": round(p, 2),
            "annual_rate_pct": 0.0,
            "tenure_months": tenure,
            "monthly_payment": round(float(monthly_payment), 2),
            "total_interest": 0.0,
            "total_payment": round(p, 2),
            "schedule": schedule,
        }

    monthly_r = (annual_r / 100.0) / 12.0
    # NumPy formula for EMI
    factor = np.power(1.0 + monthly_r, tenure)
    monthly_payment = p * (monthly_r * factor) / (factor - 1.0)

    schedule = []
    bal = p
    total_interest = 0.0

    for period in range(1, tenure + 1):
        interest_payment = bal * monthly_r
        principal_payment = monthly_payment - interest_payment
        bal = max(0.0, bal - principal_payment)
        total_interest += interest_payment
        schedule.append({
            "period": period,
            "payment": round(float(monthly_payment), 2),
            "principal_paid": round(float(principal_payment), 2),
            "interest_paid": round(float(interest_payment), 2),
            "remaining_balance": round(float(bal), 2),
        })

    return {
        "principal": round(p, 2),
        "annual_rate_pct": round(annual_r, 2),
        "tenure_months": tenure,
        "monthly_payment": round(float(monthly_payment), 2),
        "total_interest": round(float(total_interest), 2),
        "total_payment": round(float(p + total_interest), 2),
        "schedule": schedule,
    }


def get_loan_amortization(user_id: str, loan_id: str, tenure_months: Optional[int] = None) -> Optional[Dict[str, Any]]:
    loans = ResilientDB.select("loans", user_id)
    target = next((l for l in loans if str(l.get("id")) == str(loan_id)), None)
    if not target:
        return None

    principal = float(target.get("amount") or 0.0)
    interest_rate = float(target.get("interest_rate") or 0.0)
    months = tenure_months or 12

    schedule_data = calculate_amortization_schedule(principal, interest_rate, months)
    schedule_data["loan_id"] = str(loan_id)
    schedule_data["person"] = target.get("person")
    schedule_data["loan_direction"] = target.get("loan_direction")
    return schedule_data


def get_loans(user_id: str, loan_direction: Optional[str] = None) -> List[Dict[str, Any]]:
    loans = ResilientDB.select("loans", user_id, order_col="date", desc=True)
    if loan_direction:
        loans = [l for l in loans if l.get("loan_direction") == loan_direction]

    return [
        {
            "id": str(l.get("id")),
            "user_id": l.get("user_id"),
            "loan_direction": l.get("loan_direction"),
            "person": l.get("person"),
            "amount": float(l.get("amount") or 0.0),
            "type": l.get("type") or "Cash",
            "date": str(l.get("date") or ""),
            "next_settlement": str(l.get("next_settlement") or ""),
            "return_date": str(l.get("return_date") or ""),
            "interest_rate": float(l.get("interest_rate") or 0.0),
            "notes": l.get("notes") or "",
            "settled": bool(l.get("settled")),
            "settled_amount": float(l.get("settled_amount") or 0.0),
            "created_at": l.get("created_at"),
        }
        for l in loans
    ]


def create_loan(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    row = {
        "user_id": user_id,
        "loan_direction": data["loan_direction"],
        "person": data["person"],
        "amount": float(data["amount"]),
        "type": data.get("type", "Cash"),
        "date": data.get("date") or None,
        "next_settlement": data.get("next_settlement") or None,
        "return_date": data.get("return_date") or None,
        "interest_rate": float(data.get("interest_rate") or 0.0),
        "notes": data.get("notes", ""),
        "settled": 0,
        "settled_amount": 0.0,
    }
    created = ResilientDB.insert("loans", row)
    return {
        "id": str(created.get("id")),
        "user_id": created.get("user_id"),
        "loan_direction": created.get("loan_direction"),
        "person": created.get("person"),
        "amount": float(created.get("amount") or 0.0),
        "type": created.get("type"),
        "date": created.get("date"),
        "next_settlement": created.get("next_settlement"),
        "return_date": created.get("return_date"),
        "interest_rate": float(created.get("interest_rate") or 0.0),
        "notes": created.get("notes"),
        "settled": bool(created.get("settled")),
        "settled_amount": float(created.get("settled_amount") or 0.0),
        "created_at": created.get("created_at"),
    }


def settle_loan(user_id: str, loan_id: str, reduce_amount: float) -> Optional[Dict[str, Any]]:
    loans = ResilientDB.select("loans", user_id)
    target = next((l for l in loans if str(l.get("id")) == str(loan_id)), None)
    if not target:
        return None

    principal = float(target.get("amount") or 0.0)
    interest_rate = float(target.get("interest_rate") or 0.0)
    total_due = calculate_total_due(principal, interest_rate)

    current_settled = float(target.get("settled_amount") or 0.0)
    new_settled = min(total_due, current_settled + reduce_amount)
    is_settled = new_settled >= total_due

    updated = ResilientDB.update(
        "loans",
        loan_id,
        {
            "settled_amount": new_settled,
            "settled": 1 if is_settled else 0,
        },
    )
    if not updated:
        return None

    return {
        "id": str(updated.get("id")),
        "user_id": updated.get("user_id"),
        "loan_direction": updated.get("loan_direction"),
        "person": updated.get("person"),
        "amount": float(updated.get("amount") or 0.0),
        "type": updated.get("type"),
        "date": updated.get("date"),
        "next_settlement": updated.get("next_settlement"),
        "return_date": updated.get("return_date"),
        "interest_rate": float(updated.get("interest_rate") or 0.0),
        "notes": updated.get("notes"),
        "settled": bool(updated.get("settled")),
        "settled_amount": float(updated.get("settled_amount") or 0.0),
        "created_at": updated.get("created_at"),
    }


def reset_loan_settlement(user_id: str, loan_id: str) -> Optional[Dict[str, Any]]:
    updated = ResilientDB.update("loans", loan_id, {"settled_amount": 0.0, "settled": 0})
    if not updated:
        return None

    return {
        "id": str(updated.get("id")),
        "user_id": updated.get("user_id"),
        "loan_direction": updated.get("loan_direction"),
        "person": updated.get("person"),
        "amount": float(updated.get("amount") or 0.0),
        "type": updated.get("type"),
        "date": updated.get("date"),
        "next_settlement": updated.get("next_settlement"),
        "return_date": updated.get("return_date"),
        "interest_rate": float(updated.get("interest_rate") or 0.0),
        "notes": updated.get("notes"),
        "settled": bool(updated.get("settled")),
        "settled_amount": float(updated.get("settled_amount") or 0.0),
        "created_at": updated.get("created_at"),
    }


def delete_loan(user_id: str, loan_id: str) -> bool:
    return ResilientDB.delete("loans", loan_id)
