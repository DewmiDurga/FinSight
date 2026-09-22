import calendar
from datetime import datetime
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from app.services.transaction_service import get_transactions

CATEGORY_METADATA = {
    "Food & Dining": {"color": "#6366f1", "icon": "🍔"},
    "Food": {"color": "#6366f1", "icon": "🍔"},
    "Shopping": {"color": "#f43f5e", "icon": "🛍️"},
    "Transport": {"color": "#10b981", "icon": "🚌"},
    "Bills": {"color": "#f59e0b", "icon": "📄"},
    "Entertainment": {"color": "#8b5cf6", "icon": "🎬"},
    "Salary": {"color": "#059669", "icon": "💰"},
    "Other": {"color": "#64748b", "icon": "📌"},
}


def get_analytics(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    selected_month = month or datetime.now().strftime("%Y-%m")
    all_txs = get_transactions(user_id)

    # 6-Month timeline preparation
    now = datetime.now()
    six_months = []
    for i in range(5, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        m_str = f"{y:04d}-{m:02d}"
        m_label = datetime(y, m, 1).strftime("%b")
        six_months.append((m_str, m_label))

    if not all_txs:
        return {
            "monthly_income": 0.0,
            "total_expenses": 0.0,
            "net_savings": 0.0,
            "savings_rate": 0,
            "biggest_spend_category": "None",
            "biggest_spend_amount": 0.0,
            "breakdown": [],
            "monthly_trends": [{"month": label, "income": 0.0, "expense": 0.0} for _, label in six_months],
        }

    # Vectorized analysis with Pandas
    df = pd.DataFrame(all_txs)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
    df["date_str"] = df["transaction_date"].astype(str)

    # Filter for selected month (fallback to all if selected month has no records)
    month_mask = df["date_str"].str.startswith(selected_month)
    month_df = df[month_mask] if month_mask.any() else df

    # Monthly aggregates
    monthly_income = float(month_df[month_df["type"] == "income"]["amount"].sum())
    monthly_expenses = float(month_df[month_df["type"] == "expense"]["amount"].sum())
    net_savings = monthly_income - monthly_expenses
    savings_rate = round((net_savings / monthly_income * 100)) if monthly_income > 0 else 0

    # Category breakdown for expenses
    exp_df = month_df[month_df["type"] == "expense"]
    breakdown: List[Dict[str, Any]] = []
    biggest_cat = "None"
    biggest_amount = 0.0

    if not exp_df.empty:
        cat_group = exp_df.groupby("category", as_index=False)["amount"].sum()
        cat_group = cat_group.sort_values(by="amount", ascending=False)
        total_exp_sum = float(cat_group["amount"].sum())

        for _, row in cat_group.iterrows():
            cat = str(row["category"])
            amt = float(row["amount"])
            if amt > biggest_amount:
                biggest_amount = amt
                biggest_cat = cat

            meta = CATEGORY_METADATA.get(cat, {"color": "#64748b", "icon": "📌"})
            pct = round((amt / total_exp_sum) * 100) if total_exp_sum > 0 else 0
            breakdown.append({
                "category": cat,
                "amount": round(amt, 2),
                "percentage": pct,
                "color": meta["color"],
                "icon": meta["icon"],
            })

    # 6-Month Monthly Trends using Pandas grouping
    df["ym"] = df["date_str"].str.slice(0, 7)
    trend_group = df.groupby(["ym", "type"])["amount"].sum().unstack(fill_value=0.0)

    monthly_trends = []
    for m_str, m_label in six_months:
        inc = float(trend_group.loc[m_str, "income"]) if (m_str in trend_group.index and "income" in trend_group.columns) else 0.0
        exp = float(trend_group.loc[m_str, "expense"]) if (m_str in trend_group.index and "expense" in trend_group.columns) else 0.0
        monthly_trends.append({
            "month": m_label,
            "income": round(inc, 2),
            "expense": round(exp, 2),
        })

    return {
        "monthly_income": round(monthly_income, 2),
        "total_expenses": round(monthly_expenses, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": savings_rate,
        "biggest_spend_category": biggest_cat,
        "biggest_spend_amount": round(biggest_amount, 2),
        "breakdown": breakdown,
        "monthly_trends": monthly_trends,
    }


def detect_spending_anomalies(user_id: str, threshold_std: float = 2.0) -> List[Dict[str, Any]]:
    """Detect unusually high expense transactions using NumPy Z-score calculation."""
    all_txs = get_transactions(user_id)
    if not all_txs:
        return []

    df = pd.DataFrame(all_txs)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
    exp_df = df[df["type"] == "expense"].copy()

    if len(exp_df) < 3:
        return []

    amounts = exp_df["amount"].to_numpy(dtype=float)
    mean_spend = float(np.mean(amounts))
    std_spend = float(np.std(amounts))

    if std_spend == 0.0:
        return []

    z_scores = (amounts - mean_spend) / std_spend
    exp_df["z_score"] = np.round(z_scores, 2)
    anomalies_df = exp_df[exp_df["z_score"] >= threshold_std].sort_values(by="amount", ascending=False)

    results = []
    for _, row in anomalies_df.iterrows():
        results.append({
            "id": str(row.get("id")),
            "title": row.get("title") or row.get("description") or "Expense",
            "category": row.get("category", "Other"),
            "amount": round(float(row["amount"]), 2),
            "transaction_date": str(row.get("transaction_date", "")),
            "z_score": float(row["z_score"]),
            "average_spend": round(mean_spend, 2),
        })
    return results


def forecast_month_end_expense(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    """Forecast month-end spending based on current daily burn rate using NumPy / Pandas."""
    all_txs = get_transactions(user_id)
    now = datetime.now()
    target_month = month or now.strftime("%Y-%m")
    try:
        y, m = int(target_month.split("-")[0]), int(target_month.split("-")[1])
    except Exception:
        y, m = now.year, now.month
    days_in_month = calendar.monthrange(y, m)[1]

    if not all_txs:
        return {
            "month": target_month,
            "days_in_month": days_in_month,
            "days_elapsed": 0,
            "current_spend": 0.0,
            "predicted_month_end_spend": 0.0,
            "daily_average": 0.0,
        }

    df = pd.DataFrame(all_txs)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
    df["date_str"] = df["transaction_date"].astype(str)

    exp_m = df[(df["type"] == "expense") & (df["date_str"].str.startswith(target_month))]
    current_spend = float(exp_m["amount"].sum()) if not exp_m.empty else 0.0

    if target_month == now.strftime("%Y-%m"):
        days_elapsed = max(1, now.day)
    elif target_month < now.strftime("%Y-%m"):
        days_elapsed = days_in_month
    else:
        days_elapsed = 1

    daily_average = current_spend / days_elapsed
    projected_total = daily_average * days_in_month

    return {
        "month": target_month,
        "days_in_month": days_in_month,
        "days_elapsed": days_elapsed,
        "current_spend": round(current_spend, 2),
        "predicted_month_end_spend": round(projected_total, 2),
        "daily_average": round(daily_average, 2),
    }


def get_spending_insights(user_id: str, month: Optional[str] = None) -> Dict[str, Any]:
    """Combine forecast and anomaly analysis for financial intelligence."""
    return {
        "forecast": forecast_month_end_expense(user_id, month=month),
        "anomalies": detect_spending_anomalies(user_id),
    }
