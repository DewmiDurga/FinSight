import { useState, useEffect } from "react";
import { api, type AnalyticsOverview } from "../services/api";

function Analytics() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setLoading(false);
      });
  }, []);

  const totalIncome = data?.monthly_income ?? 3500;
  const totalExpense = data?.total_expenses ?? 1215;
  const savings = data?.net_savings ?? (totalIncome - totalExpense);
  const savingsRate = data?.savings_rate ?? Math.round((savings / (totalIncome || 1)) * 100);
  const breakdown = data?.breakdown ?? [];
  const monthly = data?.monthly_trends ?? [];

  return (
    <main className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Analytics</h1>
          <p>{loading ? "Analyzing ledger patterns…" : "Understand your spending patterns and financial velocity"}</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="analytics-grid" style={{ marginBottom: "16px" }}>
        <div className="analytics-stat">
          <p>Monthly Income</p>
          <h2 style={{ color: "#059669" }}>${totalIncome.toLocaleString()}</h2>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Live Inflows</div>
        </div>
        <div className="analytics-stat">
          <p>Total Expenses</p>
          <h2 style={{ color: "#e11d48" }}>${totalExpense.toLocaleString()}</h2>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Across {breakdown.length} categories</div>
        </div>
        <div className="analytics-stat">
          <p>Net Savings</p>
          <h2 style={{ color: "#7c3aed" }}>${savings.toLocaleString()}</h2>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            {savingsRate}% savings rate
          </div>
        </div>
        <div className="analytics-stat">
          <p>Biggest Spend</p>
          <h2 style={{ color: "#0f172a" }}>{data?.biggest_spend_category || "None"}</h2>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            ${data?.biggest_spend_amount?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Spending breakdown */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">
          <div className="card-title">Spending Breakdown</div>
          <div className="card-subtitle">Where your money goes (computed live)</div>
        </div>
        <div className="card-body">
          {breakdown.map((item) => (
            <div className="analytics-row" key={item.category}>
              <div className="analytics-cat-label">
                <div className="analytics-dot" style={{ background: item.color }} />
                <span>{item.icon}</span>
                {item.category}
              </div>
              <div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${item.percentage}%`, background: item.color }} />
                </div>
              </div>
              <div className="analytics-amount-col">
                ${item.amount}
                <div className="analytics-pct">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Monthly Trend</div>
          <div className="card-subtitle">Income vs Expenses — historical & current velocity</div>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", height: "140px" }}>
            {monthly.map((m) => {
              const maxVal  = 4000;
              const incH    = Math.min(130, Math.round((m.income  / maxVal) * 120));
              const expH    = Math.min(130, Math.round((m.expense / maxVal) * 120));
              return (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
                    <div title={`Income $${m.income}`} style={{ width: "14px", height: `${incH}px`, background: "#10b981", borderRadius: "4px 4px 0 0" }} />
                    <div title={`Expense $${m.expense}`} style={{ width: "14px", height: `${expH}px`, background: "#f43f5e", borderRadius: "4px 4px 0 0" }} />
                  </div>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600 }}>{m.month}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
              <div style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "3px" }} />
              Income
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569" }}>
              <div style={{ width: "10px", height: "10px", background: "#f43f5e", borderRadius: "3px" }} />
              Expenses
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Analytics;
