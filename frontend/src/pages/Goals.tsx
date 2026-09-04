import { useState, useEffect } from "react";
import { api, type GoalItem } from "../services/api";

function Goals() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addMoneyId, setAddMoneyId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const [form, setForm] = useState({ name: "", target: "", icon: "🎯", deadline: "", color: "#6366f1", bgColor: "#ede9fe" });

  const loadGoals = () => {
    setLoading(true);
    api.getGoals()
      .then((data) => {
        setGoals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch goals:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const createGoal = async () => {
    if (!form.name || !form.target) return;
    try {
      const created = await api.addGoal({
        name: form.name,
        target: Number(form.target),
        icon: form.icon,
        color: form.color,
        bg_color: form.bgColor,
        deadline: form.deadline || "No deadline",
      });
      setGoals((curr) => [...curr, created]);
      setForm({ name: "", target: "", icon: "🎯", deadline: "", color: "#6366f1", bgColor: "#ede9fe" });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  const addMoney = async (id: string) => {
    const amt = Number(addAmount);
    if (!amt || amt <= 0) return;
    try {
      const updated = await api.contributeToGoal(id, amt);
      setGoals((curr) => curr.map((g) => (g.id === id ? updated : g)));
      setAddMoneyId(null);
      setAddAmount("");
    } catch (err) {
      console.error("Failed to contribute to goal:", err);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals((curr) => curr.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  const totalSaved  = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Savings Goals</h1>
          <p>Set targets and watch your savings grow with real-time tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <span>＋</span> New Goal
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Saved</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>${totalSaved.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Target</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>${totalTarget.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Goals Completed</p>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
            {goals.filter((g) => g.saved >= g.target).length} / {goals.length}
          </div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="goals-grid">
        {loading && goals.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>Loading goals…</p>
        ) : (
          goals.map((g) => {
            const pct = Math.min(100, Math.round((g.saved / (g.target || 1)) * 100));
            const done = g.saved >= g.target;

            return (
              <div className="goal-card" key={g.id}>
                <div className="goal-card-top">
                  <div>
                    <div className="goal-icon" style={{ background: g.bg_color || "#ede9fe" }}>{g.icon}</div>
                    <div className="goal-name">{g.name}</div>
                    <div className="goal-deadline">📅 {g.deadline}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                    {done
                      ? <span className="badge badge-green">✓ Done</span>
                      : <span className="badge badge-purple">{pct}%</span>
                    }
                    <button className="btn btn-sm btn-danger" onClick={() => deleteGoal(g.id)} title="Delete">🗑</button>
                  </div>
                </div>

                <div className="goal-amounts">
                  <span className="goal-saved">${g.saved.toLocaleString()}</span>
                  <span className="goal-target">of ${g.target.toLocaleString()}</span>
                </div>

                <div className="progress-bar-bg" style={{ marginBottom: "14px" }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: done ? "#10b981" : g.color }} />
                </div>

                {/* Add money inline */}
                {addMoneyId === g.id ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Amount"
                      value={addAmount}
                      style={{ flex: 1 }}
                      autoFocus
                      onChange={(e) => setAddAmount(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMoney(g.id)}
                    />
                    <button className="btn btn-success btn-sm" onClick={() => addMoney(g.id)}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setAddMoneyId(null); setAddAmount(""); }}>Cancel</button>
                  </div>
                ) : (
                  <div className="goal-actions">
                    {!done && (
                      <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => setAddMoneyId(g.id)}>
                        💵 Add Money
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Savings Goal</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input className="form-input" type="text" placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount ($)</label>
                <input className="form-input" type="number" placeholder="5000" min="1" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="text" placeholder="e.g. Dec 2026" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <input className="form-input" type="text" placeholder="🎯" value={form.icon} style={{ width: "80px" }} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createGoal}>Create Goal</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Goals;
