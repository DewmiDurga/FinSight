from datetime import datetime
from typing import Any, Dict, List
from app.services.transaction_service import get_transactions
from app.services.budget_service import get_budgets
from app.services.goal_service import get_goals
from app.services.loan_service import get_loans


def generate_reply(user_id: str, user_text: str) -> Dict[str, Any]:
    txs = get_transactions(user_id)
    budgets = get_budgets(user_id)
    goals = get_goals(user_id)
    loans = get_loans(user_id)

    total_income = sum(t["amount"] for t in txs if t.get("type") == "income")
    total_expenses = sum(t["amount"] for t in txs if t.get("type") == "expense")
    net_savings = total_income - total_expenses
    savings_rate = round((net_savings / total_income * 100)) if total_income > 0 else 0

    # Category totals
    cat_spend: Dict[str, float] = {}
    for t in txs:
        if t.get("type") == "expense":
            c = t.get("category", "Other")
            cat_spend[c] = cat_spend.get(c, 0.0) + float(t.get("amount", 0.0))

    top_cat = max(cat_spend.items(), key=lambda x: x[1]) if cat_spend else ("None", 0.0)

    # Overbudget check
    over_budget = [b for b in budgets if b["spent"] > b["limit"]]
    near_budget = [b for b in budgets if b["spent"] >= b["limit"] * 0.85 and b["spent"] <= b["limit"]]

    lower = user_text.lower().strip()
    suggestions: List[str] = [
        "How much did I spend this month?",
        "Am I over budget?",
        "What's my savings rate?",
        "Which category costs me most?",
    ]

    if "how much" in lower and ("spend" in lower or "spent" in lower or "expense" in lower):
        reply = (
            f"📊 **Monthly Spending Overview**:\n\n"
            f"You have spent **${total_expenses:,.2f}** this month across {len(txs)} transactions.\n"
            f"- **Top Spending Category**: {top_cat[0]} (${top_cat[1]:,.2f})\n"
            f"- **Total Income**: ${total_income:,.2f}\n"
            f"- **Net Balance**: ${net_savings:,.2f} ({savings_rate}% savings rate)"
        )
    elif "over budget" in lower or "budget" in lower:
        if over_budget:
            over_lines = "\n".join([f"- **{b['category']}**: ${b['spent']:,.2f} spent (Limit: ${b['limit']:,.2f}) — ⚠️ Over by ${b['spent'] - b['limit']:,.2f}" for b in over_budget])
            reply = f"⚠️ You are currently **over budget** in {len(over_budget)} categories:\n\n{over_lines}\n\nConsider cutting back in these categories or adjusting your limits."
        elif near_budget:
            near_lines = "\n".join([f"- **{b['category']}**: ${b['spent']:,.2f} / ${b['limit']:,.2f} ({round(b['spent']/b['limit']*100)}% used)" for b in near_budget])
            reply = f"✅ You are **within budget** overall, but approaching limits in:\n\n{near_lines}"
        else:
            reply = f"🎉 Great job! All of your **{len(budgets)} budget categories** are well within limits with healthy headroom."
    elif "savings rate" in lower or "saving" in lower:
        reply = (
            f"🎯 **Your Savings Rate**: **{savings_rate}%**\n\n"
            f"- Inflow: **${total_income:,.2f}**\n"
            f"- Outflow: **${total_expenses:,.2f}**\n"
            f"- Net Saved: **${net_savings:,.2f}**\n\n"
            f"A 30%+ savings rate is considered excellent financial discipline. You are currently saving enough to meet your active goals!"
        )
    elif "category" in lower or "most" in lower:
        reply = (
            f"🏷️ **Top Expense Category**: **{top_cat[0]}**\n\n"
            f"You have spent **${top_cat[1]:,.2f}** on {top_cat[0]}, which makes up "
            f"**{round((top_cat[1]/total_expenses*100) if total_expenses > 0 else 0)}%** of your total monthly expenses."
        )
    elif "loan" in lower or "credit" in lower or "debt" in lower:
        given_count = sum(1 for l in loans if l["loan_direction"] == "given" and not l["settled"])
        got_count = sum(1 for l in loans if l["loan_direction"] == "got" and not l["settled"])
        total_given = sum(l["amount"] - l["settled_amount"] for l in loans if l["loan_direction"] == "given")
        total_got = sum(l["amount"] - l["settled_amount"] for l in loans if l["loan_direction"] == "got")
        reply = (
            f"💳 **Loans & Settlements Snapshot**:\n\n"
            f"- **Lent to others (Receivable)**: ${total_given:,.2f} ({given_count} active loans)\n"
            f"- **Borrowed (Payable)**: ${total_got:,.2f} ({got_count} active loans)\n\n"
            f"Visit the **Loans & Credit** page to record repayments or partial settlements."
        )
    elif "goal" in lower:
        completed = sum(1 for g in goals if g["saved"] >= g["target"])
        total_target = sum(g["target"] for g in goals)
        total_saved = sum(g["saved"] for g in goals)
        reply = (
            f"🎯 **Savings Goals Status**:\n\n"
            f"You have saved **${total_saved:,.2f}** of **${total_target:,.2f}** across {len(goals)} goals.\n"
            f"Completed goals: **{completed} / {len(goals)}**."
        )
    else:
        reply = (
            f"👋 I examined your current finances:\n"
            f"- **Net Balance**: ${net_savings:,.2f} ({savings_rate}% savings rate)\n"
            f"- **Monthly Spending**: ${total_expenses:,.2f}\n"
            f"- **Active Budgets**: {len(budgets)}\n"
            f"- **Active Goals**: {len(goals)}\n\n"
            f"What would you like assistance with? Click any suggestion or type your question below!"
        )

    return {
        "role": "assistant",
        "text": reply,
        "timestamp": datetime.now().strftime("%I:%M %p"),
        "suggestions": suggestions,
    }
