import { useState, useEffect } from "react";
import { api, type BudgetItem } from "../services/api";

function Budgets() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({ category: "", limit: "", icon: "📦", color: "#6366f1", bgColor: "#ede9fe" });

  const loadBudgets = () => {
    setLoading(true);
    api.getBudgets()
      .then((data) => {
        setBudgets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load budgets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const openNew = () => {
    setEditId(null);
    setForm({ category: "", limit: "", icon: "📦", color: "#6366f1", bgColor: "#ede9fe" });
    setShowModal(true);
  };

  const openEdit = (b: BudgetItem) => {
    setEditId(b.id);
    setForm({ category: b.category, limit: String(b.limit), icon: b.icon, color: b.color, bgColor: b.bg_color });
    setShowModal(true);
  };

  const saveForm = async () => {
    if (!form.category || !form.limit) return;
    try {
      if (editId !== null) {
        const updated = await api.updateBudget(editId, {
          category: form.category,
          limit_amount: Number(form.limit),
          icon: form.icon,
          color: form.color,
          bg_color: form.bgColor,
        });
        setBudgets((curr) => curr.map((b) => (b.id === editId ? updated : b)));
      } else {
        const created = await api.addBudget({
          category: form.category,
          limit_amount: Number(form.limit),
          icon: form.icon,
          color: form.color,
          bg_color: form.bgColor,
        });
        setBudgets((curr) => [...curr, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await api.deleteBudget(id);
      setBudgets((curr) => curr.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Budgets</h1>
          <p>Set and track your monthly spending limits with live calculation</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <span>＋</span> New Budget
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Budget</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>${totalLimit.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Spent</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#e11d48", marginTop: "4px" }}>${totalSpent.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: totalLimit - totalSpent >= 0 ? "#059669" : "#e11d48", marginTop: "4px" }}>
            ${(totalLimit - totalSpent).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="budget-grid">
        {loading && budgets.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Loading budgets…</p>
        ) : (
          budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spent / (b.limit || 1)) * 100));
            const barColor = b.spent >= b.limit ? "#f43f5e" : pct > 80 ? "#f59e0b" : b.color;
            const statusBadge = b.spent >= b.limit ? "badge badge-red" : pct > 80 ? "badge badge-amber" : "badge badge-green";
            const statusText  = b.spent >= b.limit ? "Over budget" : pct > 80 ? "Almost full" : "On track";

            return (
              <div className="budget-card" key={b.id}>
                <div className="budget-card-top">
                  <div className="budget-label">
                    <div className="budget-label-icon" style={{ background: b.bg_color || "#ede9fe" }}>
                      {b.icon}
                    </div>
                    <div>
                      <div className="budget-name">{b.category}</div>
                      <div className="budget-spent">${b.spent} of ${b.limit}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={statusBadge}>{statusText}</span>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(b)} title="Edit">✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteBudget(b.id)} title="Delete">🗑</button>
                  </div>
                </div>

                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>

                <div className="budget-values">
                  <span>{pct}% used</span>
                  <strong>${b.limit - b.spent > 0 ? (b.limit - b.spent).toFixed(0) + " left" : "Over by $" + (b.spent - b.limit).toFixed(0)}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId !== null ? "Edit Budget" : "New Budget"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Food & Dining"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Limit ($)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="500"
                  min="1"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="📦"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveForm}>
                {editId !== null ? "Save Changes" : "Create Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Budgets;
