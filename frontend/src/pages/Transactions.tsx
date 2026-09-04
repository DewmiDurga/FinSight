import { useState, useEffect } from "react";
import { api, type TransactionItem } from "../services/api";

const categoryIcons: Record<string, string> = {
  Food: "🍔", "Food & Dining": "🍔", Transport: "🚌", Shopping: "🛍️",
  Bills: "📄", Entertainment: "🎬", Salary: "💰", Other: "📌",
};

const categories = ["Food & Dining", "Transport", "Shopping", "Bills", "Entertainment", "Salary", "Other"];

interface TransactionsProps {
  selectedDate?: string;
  selectedMonth?: string;
}

function Transactions({ selectedDate, selectedMonth }: TransactionsProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [amount, setAmount]           = useState("");
  const [category, setCategory]       = useState("Food & Dining");
  const [type, setType]               = useState<"income" | "expense">("expense");
  const [filter, setFilter]           = useState<"all" | "income" | "expense">("all");
  const [dateFilter, setDateFilter]   = useState<"all" | "month" | "day">("all");

  const loadTransactions = () => {
    setLoading(true);
    api.getTransactions()
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch transactions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      const newTx = await api.addTransaction({
        description,
        amount: Number(amount),
        category,
        type,
        transaction_date: selectedDate || new Date().toISOString().split("T")[0],
      });
      setTransactions((curr) => [newTx, ...curr]);
      setDescription("");
      setAmount("");
    } catch (err) {
      console.error("Failed to add transaction:", err);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((curr) => curr.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const filtered = transactions
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .filter((t) => {
      if (dateFilter === "day" && selectedDate) return t.date === selectedDate;
      if (dateFilter === "month" && selectedMonth) return t.date.startsWith(selectedMonth);
      return true;
    });

  const totalIncome  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Transactions</h1>
          <p>Track your income and expenses with live database synchronization</p>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Income</p>
          <div className="amount-positive" style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>+${totalIncome.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Expenses</p>
          <div className="amount-negative" style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>−${totalExpense.toFixed(2)}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Net Balance</p>
          <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px", color: totalIncome - totalExpense >= 0 ? "#059669" : "#e11d48" }}>
            ${(totalIncome - totalExpense).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add form */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div className="card-title">➕ Add Transaction</div>
        </div>
        <div className="card-body">
          <form onSubmit={addTransaction}>
            <div className="form-row">
              <div className="form-group grow">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Coffee, Rent, Salary…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  style={{ width: "130px" }}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as "income" | "expense")}
                >
                  <option value="expense">💳 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary">
                  <span>＋</span> Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div className="card-title">Transaction History</div>
            <div className="card-subtitle">
              Showing {filtered.length} transactions {dateFilter !== "all" && `• Filter: ${dateFilter === "month" ? selectedMonth : selectedDate}`}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Date filter */}
            <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
              <button
                className={`btn btn-sm ${dateFilter === "all" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: "11.5px", border: "none" }}
                onClick={() => setDateFilter("all")}
              >
                All Dates
              </button>
              <button
                className={`btn btn-sm ${dateFilter === "month" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: "11.5px", border: "none" }}
                onClick={() => setDateFilter("month")}
                title={`Filter by ${selectedMonth}`}
              >
                📅 Month ({selectedMonth?.slice(5)})
              </button>
              <button
                className={`btn btn-sm ${dateFilter === "day" ? "btn-primary" : "btn-ghost"}`}
                style={{ padding: "4px 8px", fontSize: "11.5px", border: "none" }}
                onClick={() => setDateFilter("day")}
                title={`Filter by ${selectedDate}`}
              >
                🗓 Selected Day
              </button>
            </div>

            {/* Type filter */}
            <div style={{ display: "flex", gap: "4px" }}>
              {(["all", "income", "expense"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                >
                  {f === "all" ? "All" : f === "income" ? "💰 Income" : "💳 Expenses"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: "0 22px" }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <p>{loading ? "Loading transactions…" : "No transactions yet"}</p>
              <span>Add your first one using the form above</span>
            </div>
          ) : (
            filtered.map((tx) => (
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
                  <span className="transaction-date">{tx.date}</span>
                  <span className={tx.type === "income" ? "amount-positive" : "amount-negative"}>
                    {tx.type === "income" ? "+" : "−"}${tx.amount.toFixed(2)}
                  </span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTransaction(tx.id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
