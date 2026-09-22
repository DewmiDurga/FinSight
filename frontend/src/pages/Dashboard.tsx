import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import { api, type DashboardData } from "../services/api";

const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔", Food: "🍔", Salary: "💰", Entertainment: "🎬", Transport: "🚌",
  Shopping: "🛍️", Bills: "📄", Other: "📌",
};

interface DashboardProps {
  selectedDate?: string;
  selectedMonth?: string;
}

function Dashboard({ selectedMonth }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getDashboard(selectedMonth)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  const monthDisplay = data?.month_display || (selectedMonth
    ? new Date(Number(selectedMonth.split("-")[0]), Number(selectedMonth.split("-")[1]) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }));

  return (
    <main className="page-content">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Good morning 👋</h1>
          <p>{loading ? "Syncing live snapshot…" : `Here's your financial snapshot for ${monthDisplay}`}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {data?.stats?.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
            change={stat.change}
          />
        )) || (
          <>
            <StatCard title="Total Balance" value="$0.00" icon="🏦" color="blue" change="Calculated balance" />
            <StatCard title="Monthly Income" value="$0.00" icon="💰" color="green" change="Total inflows" />
            <StatCard title="Monthly Expenses" value="$0.00" icon="💳" color="red" change="Total outflows" />
            <StatCard title="Savings" value="$0.00" icon="🎯" color="purple" change="Total saved" />
          </>
        )}
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Transactions</div>
              <div className="card-subtitle">Last 4 activities</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "8px 22px" }}>
            {data?.recent_transactions?.length ? (
              data.recent_transactions.map((tx) => (
                <div className="transaction-row" key={tx.id}>
                  <div className="transaction-left">
                    <div className={`transaction-icon ${tx.type}`}>
                      {categoryIcons[tx.category] ?? "📌"}
                    </div>
                    <div className="transaction-info">
                      <strong>{tx.description}</strong>
                      <span>{tx.category} · {tx.date}</span>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <span className={tx.type === "income" ? "amount-positive" : "amount-negative"}>
                      {tx.type === "income" ? "+" : "−"}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Budget Status</div>
              <div className="card-subtitle">This month's limits</div>
            </div>
          </div>
          <div className="card-body">
            {data?.budget_status?.length ? (
              data.budget_status.map((b) => {
                const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                return (
                  <div key={b.id || b.category} style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>
                        {b.icon} {b.category}
                      </span>
                      <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                        ${b.spent} / ${b.limit}
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, background: pct >= 95 ? "#f43f5e" : b.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No active budgets found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
