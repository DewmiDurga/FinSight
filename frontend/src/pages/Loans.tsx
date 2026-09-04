import { useState, useEffect } from "react";
import { api } from "../services/api";

/* ─── Types ────────────────────────────────────────────── */
interface GivenLoan {
  id: string | number;
  person: string;
  amount: number;
  date: string;
  nextSettlement: string;
  returnDate: string;
  interestRate: number; // monthly interest rate %
  notes: string;
  settled: boolean;
  settledAmount: number; // amount paid/settled so far
}

interface GotLoan {
  id: string | number;
  person: string;
  amount: number;
  type: "Cash" | "Koko" | "Instant Pay" | "Bank Transfer" | "Other";
  date: string;
  nextSettlement: string;
  returnDate: string;
  interestRate: number; // monthly interest rate %
  notes: string;
  settled: boolean;
  settledAmount: number; // amount paid/settled so far
}

interface LoansProps {
  selectedDate?: string;
  selectedMonth?: string;
}

/* ─── Helpers ──────────────────────────────────────────── */
const loanTypeIcons: Record<string, string> = {
  Cash: "💵",
  Koko: "📱",
  "Instant Pay": "⚡",
  "Bank Transfer": "🏦",
  Other: "💳",
};

const payTypes = ["Cash", "Koko", "Instant Pay", "Bank Transfer", "Other"] as const;

function calculateMonthlyInterest(principal: number, monthlyRatePct: number): number {
  if (!principal || !monthlyRatePct) return 0;
  return (principal * monthlyRatePct) / 100;
}

function calculateTotalDue(principal: number, monthlyRatePct: number): number {
  return principal + calculateMonthlyInterest(principal, monthlyRatePct);
}

function calculateRemainingDue(principal: number, monthlyRatePct: number, settledAmount: number): number {
  const total = calculateTotalDue(principal, monthlyRatePct);
  return Math.max(0, total - (settledAmount || 0));
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

function dueBadge(dateStr: string) {
  const d = daysUntil(dateStr);
  if (d === null) return null;
  if (d < 0)  return <span className="badge badge-red">Overdue {Math.abs(d)}d</span>;
  if (d === 0) return <span className="badge badge-amber">Due today</span>;
  if (d <= 7)  return <span className="badge badge-amber">Due in {d}d</span>;
  return <span className="badge badge-green">Due in {d}d</span>;
}

/* ─── Default data with partial settlement examples ─────── */
const defaultGiven: GivenLoan[] = [
  { id: 1, person: "Rahul",  amount: 2000, date: "2026-08-01", nextSettlement: "2026-09-15", returnDate: "2026-10-01", interestRate: 1.5, notes: "Personal loan for travel",  settled: false, settledAmount: 500 },
  { id: 2, person: "Priya",  amount: 500,  date: "2026-08-20", nextSettlement: "2026-09-05", returnDate: "2026-09-20", interestRate: 2.0, notes: "Short-term help", settled: false, settledAmount: 0 },
  { id: 3, person: "Kavinda", amount: 1200, date: "2026-08-25", nextSettlement: "2026-09-25", returnDate: "2026-11-25", interestRate: 0,   notes: "Friend loan (no interest)", settled: false, settledAmount: 200 },
];

const defaultGot: GotLoan[] = [
  { id: 1, person: "Koko Finance",   amount: 5000, type: "Koko",         date: "2026-07-15", nextSettlement: "2026-09-15", returnDate: "2026-12-15", interestRate: 1.5, notes: "Monthly installment via Koko", settled: false, settledAmount: 1500 },
  { id: 2, person: "Ravi",           amount: 1500, type: "Cash",         date: "2026-08-10", nextSettlement: "2026-10-01", returnDate: "2026-10-10", interestRate: 0,   notes: "Cash loan from colleague", settled: false, settledAmount: 0 },
  { id: 3, person: "Dialog Finance", amount: 3000, type: "Instant Pay", date: "2026-06-01", nextSettlement: "2026-09-01", returnDate: "2026-12-01", interestRate: 2.5, notes: "Instant cash advance", settled: false, settledAmount: 750 },
];

/* ─── Empty form states ──────────────────────────────────── */
const emptyGiven = { person: "", amount: "", date: "", nextSettlement: "", returnDate: "", interestRate: "", notes: "" };
const emptyGot   = { person: "", amount: "", type: "Cash" as GotLoan["type"], date: "", nextSettlement: "", returnDate: "", interestRate: "", notes: "" };

/* ═══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
function Loans({ selectedMonth }: LoansProps) {
  const [tab, setTab] = useState<"given" | "got">("given");

  /* Given state */
  const [givenLoans, setGivenLoans] = useState<GivenLoan[]>([]);
  const [showGivenModal, setShowGivenModal] = useState(false);
  const [givenForm, setGivenForm] = useState(emptyGiven);

  /* Got state */
  const [gotLoans, setGotLoans] = useState<GotLoan[]>([]);
  const [showGotModal, setShowGotModal] = useState(false);
  const [gotForm, setGotForm] = useState(emptyGot);

  /* Selected Loan for Detailed Modal View */
  const [detailLoan, setDetailLoan] = useState<{ loan: GivenLoan | GotLoan; type: "given" | "got" } | null>(null);

  /* Inline / modal settlement input state */
  const [settlePayAmount, setSettlePayAmount] = useState<string>("");
  const [settleSuccessMsg, setSettleSuccessMsg] = useState<string>("");

  const loadLoans = () => {
    api.getLoans()
      .then((data) => {
        const given: GivenLoan[] = data
          .filter((l) => l.loan_direction === "given")
          .map((l) => ({
            id: l.id,
            person: l.person,
            amount: l.amount,
            date: l.date,
            nextSettlement: l.next_settlement,
            returnDate: l.return_date,
            interestRate: l.interest_rate,
            notes: l.notes,
            settled: l.settled,
            settledAmount: l.settled_amount,
          }));

        const got: GotLoan[] = data
          .filter((l) => l.loan_direction === "got")
          .map((l) => ({
            id: l.id,
            person: l.person,
            amount: l.amount,
            type: (l.type || "Cash") as GotLoan["type"],
            date: l.date,
            nextSettlement: l.next_settlement,
            returnDate: l.return_date,
            interestRate: l.interest_rate,
            notes: l.notes,
            settled: l.settled,
            settledAmount: l.settled_amount,
          }));

        setGivenLoans(given.length > 0 ? given : defaultGiven);
        setGotLoans(got.length > 0 ? got : defaultGot);
      })
      .catch((err) => {
        console.error("Failed to load loans:", err);
        setGivenLoans(defaultGiven);
        setGotLoans(defaultGot);
      });
  };

  useEffect(() => {
    loadLoans();
  }, []);

  /* ── Add Given ── */
  const addGiven = async () => {
    if (!givenForm.person || !givenForm.amount) return;
    try {
      const created = await api.addLoan({
        loan_direction: "given",
        person: givenForm.person,
        amount: Number(givenForm.amount),
        date: givenForm.date || new Date().toISOString().split("T")[0],
        next_settlement: givenForm.nextSettlement,
        return_date: givenForm.returnDate,
        interest_rate: Number(givenForm.interestRate) || 0,
        notes: givenForm.notes,
      });
      setGivenLoans((p) => [
        {
          id: created.id,
          person: created.person,
          amount: created.amount,
          date: created.date,
          nextSettlement: created.next_settlement,
          returnDate: created.return_date,
          interestRate: created.interest_rate,
          notes: created.notes,
          settled: created.settled,
          settledAmount: created.settled_amount,
        },
        ...p,
      ]);
      setGivenForm(emptyGiven);
      setShowGivenModal(false);
    } catch (err) {
      console.error("Failed to add given loan:", err);
    }
  };

  /* ── Add Got ── */
  const addGot = async () => {
    if (!gotForm.person || !gotForm.amount) return;
    try {
      const created = await api.addLoan({
        loan_direction: "got",
        person: gotForm.person,
        amount: Number(gotForm.amount),
        type: gotForm.type,
        date: gotForm.date || new Date().toISOString().split("T")[0],
        next_settlement: gotForm.nextSettlement,
        return_date: gotForm.returnDate,
        interest_rate: Number(gotForm.interestRate) || 0,
        notes: gotForm.notes,
      });
      setGotLoans((p) => [
        {
          id: created.id,
          person: created.person,
          amount: created.amount,
          type: (created.type || "Cash") as GotLoan["type"],
          date: created.date,
          nextSettlement: created.next_settlement,
          returnDate: created.return_date,
          interestRate: created.interest_rate,
          notes: created.notes,
          settled: created.settled,
          settledAmount: created.settled_amount,
        },
        ...p,
      ]);
      setGotForm(emptyGot);
      setShowGotModal(false);
    } catch (err) {
      console.error("Failed to add got loan:", err);
    }
  };

  /* ── Settle Amount Reducer ── */
  const applySettlementReduction = async (loanId: string | number, type: "given" | "got", reduceAmount: number) => {
    if (!reduceAmount || reduceAmount <= 0) return;

    try {
      await api.settleLoan(String(loanId), reduceAmount);
    } catch (err) {
      console.error("Failed to settle loan on backend:", err);
    }

    if (type === "given") {
      setGivenLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId) return l;
          const totalDue = calculateTotalDue(l.amount, l.interestRate);
          const newSettledAmount = (l.settledAmount || 0) + reduceAmount;
          const isFullySettled = newSettledAmount >= totalDue;
          const updated = {
            ...l,
            settledAmount: Math.min(totalDue, newSettledAmount),
            settled: isFullySettled,
          };
          if (detailLoan?.loan.id === loanId) {
            setDetailLoan({ loan: updated, type: "given" });
          }
          return updated;
        })
      );
    } else {
      setGotLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId) return l;
          const totalDue = calculateTotalDue(l.amount, l.interestRate);
          const newSettledAmount = (l.settledAmount || 0) + reduceAmount;
          const isFullySettled = newSettledAmount >= totalDue;
          const updated = {
            ...l,
            settledAmount: Math.min(totalDue, newSettledAmount),
            settled: isFullySettled,
          };
          if (detailLoan?.loan.id === loanId) {
            setDetailLoan({ loan: updated, type: "got" });
          }
          return updated;
        })
      );
    }

    setSettlePayAmount("");
    setSettleSuccessMsg(`✓ Successfully reduced due amount by $${reduceAmount.toFixed(2)}`);
    setTimeout(() => setSettleSuccessMsg(""), 3500);
  };

  /* ── Reset Settlements ── */
  const resetSettlement = async (loanId: string | number, type: "given" | "got") => {
    try {
      await api.resetLoanSettlement(String(loanId));
    } catch (err) {
      console.error("Failed to reset settlement on backend:", err);
    }

    if (type === "given") {
      setGivenLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId) return l;
          const updated = { ...l, settledAmount: 0, settled: false };
          if (detailLoan?.loan.id === loanId) setDetailLoan({ loan: updated, type: "given" });
          return updated;
        })
      );
    } else {
      setGotLoans((prev) =>
        prev.map((l) => {
          if (l.id !== loanId) return l;
          const updated = { ...l, settledAmount: 0, settled: false };
          if (detailLoan?.loan.id === loanId) setDetailLoan({ loan: updated, type: "got" });
          return updated;
        })
      );
    }
    setSettleSuccessMsg("Settlements reset to zero");
    setTimeout(() => setSettleSuccessMsg(""), 3000);
  };

  const deleteGiven = async (id: string | number) => {
    try {
      await api.deleteLoan(String(id));
    } catch (err) {
      console.error("Failed to delete loan:", err);
    }
    setGivenLoans((p) => p.filter((l) => l.id !== id));
    if (detailLoan?.loan.id === id) setDetailLoan(null);
  };

  const deleteGot = async (id: string | number) => {
    try {
      await api.deleteLoan(String(id));
    } catch (err) {
      console.error("Failed to delete loan:", err);
    }
    setGotLoans((p) => p.filter((l) => l.id !== id));
    if (detailLoan?.loan.id === id) setDetailLoan(null);
  };

  /* ── Summaries ── */
  const activeGiven = givenLoans.filter((l) => !l.settled);
  const activeGot   = gotLoans.filter((l) => !l.settled);

  const totalGivenPrincipal = activeGiven.reduce((s, l) => s + l.amount, 0);
  const totalGivenRemainingDue = activeGiven.reduce((s, l) => s + calculateRemainingDue(l.amount, l.interestRate, l.settledAmount), 0);
  const totalGivenSettled = givenLoans.reduce((s, l) => s + (l.settledAmount || 0), 0);
  const totalGivenMonthlyInterest = activeGiven.reduce((s, l) => s + calculateMonthlyInterest(l.amount, l.interestRate), 0);

  const totalGotPrincipal = activeGot.reduce((s, l) => s + l.amount, 0);
  const totalGotRemainingDue = activeGot.reduce((s, l) => s + calculateRemainingDue(l.amount, l.interestRate, l.settledAmount), 0);
  const totalGotSettled = gotLoans.reduce((s, l) => s + (l.settledAmount || 0), 0);
  const totalGotMonthlyInterest = activeGot.reduce((s, l) => s + calculateMonthlyInterest(l.amount, l.interestRate), 0);

  const overdueGiven = activeGiven.filter((l) => daysUntil(l.returnDate) !== null && (daysUntil(l.returnDate) ?? 0) < 0).length;
  const overdueGot   = activeGot.filter((l) => daysUntil(l.returnDate) !== null && (daysUntil(l.returnDate) ?? 0) < 0).length;

  /* Live form interest preview */
  const givenFormAmount = Number(givenForm.amount) || 0;
  const givenFormRate = Number(givenForm.interestRate) || 0;
  const givenFormMonthlyInt = calculateMonthlyInterest(givenFormAmount, givenFormRate);

  const gotFormAmount = Number(gotForm.amount) || 0;
  const gotFormRate = Number(gotForm.interestRate) || 0;
  const gotFormMonthlyInt = calculateMonthlyInterest(gotFormAmount, gotFormRate);

  /* ═══ RENDER ═══ */
  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Loans & Credit</h1>
          <p>
            Track money lent & borrowed • Reduce due amounts as payments are settled
            {selectedMonth && <span style={{ marginLeft: "8px", color: "#6366f1", fontWeight: 600 }}>• Active Month: {selectedMonth}</span>}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => tab === "given" ? setShowGivenModal(true) : setShowGotModal(true)}
        >
          ＋ {tab === "given" ? "Record Given Loan" : "Record Got Loan"}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        {tab === "given" ? (
          <>
            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #6366f1" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Principal Lent</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#6366f1", marginTop: "4px" }}>${totalGivenPrincipal.toLocaleString()}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>{activeGiven.length} active loans</div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #8b5cf6" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining Due</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
                ${totalGivenRemainingDue.toFixed(2)}
              </div>
              <div style={{ fontSize: "12px", color: "#059669", marginTop: "3px", fontWeight: 600 }}>
                ${totalGivenSettled.toFixed(2)} settled so far
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #10b981" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Interest Gain</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
                +${totalGivenMonthlyInterest.toFixed(2)}<span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}> /mo</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Calculated return</div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #f59e0b" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue Loans</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: overdueGiven > 0 ? "#e11d48" : "#059669", marginTop: "4px" }}>
                {overdueGiven}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Past return date</div>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #f43f5e" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Principal Borrowed</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#f43f5e", marginTop: "4px" }}>${totalGotPrincipal.toLocaleString()}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>{activeGot.length} active borrowings</div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #8b5cf6" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining Due</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#7c3aed", marginTop: "4px" }}>
                ${totalGotRemainingDue.toFixed(2)}
              </div>
              <div style={{ fontSize: "12px", color: "#059669", marginTop: "3px", fontWeight: 600 }}>
                ${totalGotSettled.toFixed(2)} paid off so far
              </div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #e11d48" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Interest Cost</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#e11d48", marginTop: "4px" }}>
                -${totalGotMonthlyInterest.toFixed(2)}<span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}> /mo</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Cost of borrowing</div>
            </div>

            <div className="card" style={{ padding: "16px 20px", borderTop: "3px solid #f59e0b" }}>
              <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue Payments</p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: overdueGot > 0 ? "#e11d48" : "#059669", marginTop: "4px" }}>
                {overdueGot}
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>Payments past due</div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
        <button
          className={`btn btn-sm ${tab === "given" ? "btn-primary" : "btn-ghost"}`}
          style={{ border: "none" }}
          onClick={() => setTab("given")}
        >
          💸 Loans Given ({givenLoans.length})
        </button>
        <button
          className={`btn btn-sm ${tab === "got" ? "btn-primary" : "btn-ghost"}`}
          style={{ border: "none" }}
          onClick={() => setTab("got")}
        >
          📥 Loans Got ({gotLoans.length})
        </button>
      </div>

      {/* ── GIVEN TAB (Clean 4-column overview with reducing due amount) ── */}
      {tab === "given" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💸 Loans Given (Lent Out)</div>
              <div className="card-subtitle">Due amount reduces automatically as repayments are settled</div>
            </div>
          </div>

          {givenLoans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💸</div>
              <p>No loans given yet</p>
              <span>Click "Record Given Loan" to add one</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="loan-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Principal Amount</th>
                    <th>Due Amount</th>
                    <th>Next Date to Settle</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {givenLoans.map((loan) => {
                    const totalDue = calculateTotalDue(loan.amount, loan.interestRate);
                    const remainingDue = calculateRemainingDue(loan.amount, loan.interestRate, loan.settledAmount);
                    const pctSettled = Math.min(100, Math.round(((loan.settledAmount || 0) / totalDue) * 100));

                    return (
                      <tr
                        key={loan.id}
                        className={loan.settled ? "loan-row settled" : "loan-row"}
                        onClick={() => {
                          setDetailLoan({ loan, type: "given" });
                          setSettlePayAmount("");
                          setSettleSuccessMsg("");
                        }}
                        title="Click to view full details or record a settlement"
                      >
                        <td>
                          <div className="loan-person">
                            <div className="loan-avatar">{loan.person[0].toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{loan.person}</div>
                              <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                                {loan.settled ? (
                                  <span className="badge badge-green">✓ Fully Settled</span>
                                ) : loan.settledAmount > 0 ? (
                                  <span className="badge badge-purple">{pctSettled}% Settled</span>
                                ) : (
                                  <span className="badge badge-blue">Active</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#0f172a", fontSize: "15px" }}>${loan.amount.toLocaleString()}</strong>
                        </td>
                        <td>
                          {loan.settled ? (
                            <div>
                              <span className="badge badge-green">✓ Fully Settled ($0.00 left)</span>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                Paid ${totalDue.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <strong style={{ color: remainingDue > 0 ? "#059669" : "#64748b", fontSize: "16px" }}>
                                ${remainingDue.toFixed(2)}
                              </strong>
                              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>remaining</span>

                              {loan.settledAmount > 0 && (
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  ${loan.settledAmount.toFixed(2)} settled of ${totalDue.toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {loan.nextSettlement ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{loan.nextSettlement}</span>
                              {!loan.settled && dueBadge(loan.nextSettlement)}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ marginRight: "6px" }}
                            onClick={() => {
                              setDetailLoan({ loan, type: "given" });
                              setSettlePayAmount("");
                              setSettleSuccessMsg("");
                            }}
                          >
                            💰 Settle / Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── GOT TAB (Clean 4-column overview with reducing due amount) ── */}
      {tab === "got" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📥 Loans Got (Borrowed)</div>
              <div className="card-subtitle">Due amount reduces as you pay installments or settlements</div>
            </div>
          </div>

          {gotLoans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📥</div>
              <p>No borrowed loans yet</p>
              <span>Click "Record Got Loan" to add one</span>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="loan-table">
                <thead>
                  <tr>
                    <th>Person / Lender</th>
                    <th>Principal Amount</th>
                    <th>Due Amount</th>
                    <th>Next Date to Settle</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {gotLoans.map((loan) => {
                    const totalDue = calculateTotalDue(loan.amount, loan.interestRate);
                    const remainingDue = calculateRemainingDue(loan.amount, loan.interestRate, loan.settledAmount);
                    const pctSettled = Math.min(100, Math.round(((loan.settledAmount || 0) / totalDue) * 100));

                    return (
                      <tr
                        key={loan.id}
                        className={loan.settled ? "loan-row settled" : "loan-row"}
                        onClick={() => {
                          setDetailLoan({ loan, type: "got" });
                          setSettlePayAmount("");
                          setSettleSuccessMsg("");
                        }}
                        title="Click to view full details or record a settlement"
                      >
                        <td>
                          <div className="loan-person">
                            <div className="loan-avatar" style={{ background: "#ede9fe", color: "#6366f1" }}>
                              {loan.person[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{loan.person}</div>
                              <div style={{ fontSize: "11.5px", color: "#64748b", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                                <span>{loanTypeIcons[loan.type]} {loan.type}</span>
                                <span>•</span>
                                {loan.settled ? (
                                  <span className="badge badge-green">✓ Fully Settled</span>
                                ) : loan.settledAmount > 0 ? (
                                  <span className="badge badge-purple">{pctSettled}% Paid</span>
                                ) : (
                                  <span className="badge badge-red">Active</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "#0f172a", fontSize: "15px" }}>${loan.amount.toLocaleString()}</strong>
                        </td>
                        <td>
                          {loan.settled ? (
                            <div>
                              <span className="badge badge-green">✓ Fully Settled ($0.00 left)</span>
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                Repaid ${totalDue.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <strong style={{ color: "#e11d48", fontSize: "16px" }}>
                                ${remainingDue.toFixed(2)}
                              </strong>
                              <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>remaining</span>

                              {loan.settledAmount > 0 && (
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  ${loan.settledAmount.toFixed(2)} paid of ${totalDue.toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          {loan.nextSettlement ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{loan.nextSettlement}</span>
                              {!loan.settled && dueBadge(loan.nextSettlement)}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ marginRight: "6px" }}
                            onClick={() => {
                              setDetailLoan({ loan, type: "got" });
                              setSettlePayAmount("");
                              setSettleSuccessMsg("");
                            }}
                          >
                            💰 Settle / Details →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ SPECIFIC LOAN FULL DETAILS & SETTLEMENT REDUCTION MODAL ═══ */}
      {detailLoan && (() => {
        const currentLoan = detailLoan.loan;
        const totalDue = calculateTotalDue(currentLoan.amount, currentLoan.interestRate);
        const settledAmount = currentLoan.settledAmount || 0;
        const remainingDue = calculateRemainingDue(currentLoan.amount, currentLoan.interestRate, settledAmount);
        const pctSettled = Math.min(100, Math.round((settledAmount / totalDue) * 100));

        return (
          <div className="modal-overlay" onClick={() => setDetailLoan(null)}>
            <div className="modal" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="loan-avatar" style={{ width: "38px", height: "38px", fontSize: "16px" }}>
                    {currentLoan.person[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", lineHeight: 1.2 }}>{currentLoan.person}</h3>
                    <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      {detailLoan.type === "given" ? "💸 Loan Given (You Lent)" : `📥 Loan Got (${(currentLoan as GotLoan).type || "Cash"})`}
                    </p>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setDetailLoan(null)}>✕</button>
              </div>

              <div className="modal-body" style={{ gap: "18px" }}>
                {/* Due Amount Highlight Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Principal</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                      ${currentLoan.amount.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Settled So Far</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
                      ${settledAmount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {pctSettled}% of total
                    </div>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1.5px solid #8b5cf6" }}>
                    <div style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>Remaining Due</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: remainingDue > 0 ? "#7c3aed" : "#059669", marginTop: "4px" }}>
                      ${remainingDue.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      {remainingDue <= 0 ? "✓ Zero Balance" : `Total was $${totalDue.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Settlement Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "5px" }}>
                    <span>Settlement Progress</span>
                    <strong>{pctSettled}% completed</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: "9px" }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pctSettled}%`,
                        background: pctSettled >= 100 ? "#10b981" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      }}
                    />
                  </div>
                </div>

                {/* ── INTERACTIVE SETTLEMENT PAYMENT SECTION ── */}
                <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e3a8a" }}>
                      💰 Reduce Due Amount (Record Settlement)
                    </div>
                    {settledAmount > 0 && (
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ fontSize: "11px", padding: "2px 8px" }}
                        onClick={() => resetSettlement(currentLoan.id, detailLoan.type)}
                        title="Reset all settlements to 0"
                      >
                        Reset Payments
                      </button>
                    )}
                  </div>

                  {remainingDue > 0 ? (
                    <>
                      <p style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
                        Enter payment amount to reduce the remaining due balance of <strong>${remainingDue.toFixed(2)}</strong>:
                      </p>

                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <span style={{ position: "absolute", left: "12px", top: "10px", fontWeight: 700, color: "#64748b" }}>$</span>
                          <input
                            type="number"
                            className="form-input"
                            style={{ paddingLeft: "26px", width: "100%" }}
                            placeholder="Enter amount (e.g. 250)"
                            min="0.01"
                            max={remainingDue}
                            step="0.01"
                            value={settlePayAmount}
                            onChange={(e) => setSettlePayAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                applySettlementReduction(currentLoan.id, detailLoan.type, Number(settlePayAmount));
                              }
                            }}
                          />
                        </div>

                        <button
                          className="btn btn-success"
                          disabled={!settlePayAmount || Number(settlePayAmount) <= 0}
                          onClick={() => applySettlementReduction(currentLoan.id, detailLoan.type, Number(settlePayAmount))}
                        >
                          Reduce Due ➔
                        </button>
                      </div>

                      {/* Quick Shortcut Buttons */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11.5px", color: "#64748b", alignSelf: "center", marginRight: "2px" }}>Quick:</span>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: "11.5px", padding: "4px 9px", background: "#ffffff" }}
                          onClick={() => setSettlePayAmount(remainingDue.toFixed(2))}
                        >
                          Full Remaining (${remainingDue.toFixed(2)})
                        </button>
                        {remainingDue > 100 && (
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: "11.5px", padding: "4px 9px", background: "#ffffff" }}
                            onClick={() => setSettlePayAmount((remainingDue / 2).toFixed(2))}
                          >
                            Half (${(remainingDue / 2).toFixed(2)})
                          </button>
                        )}
                        {remainingDue >= 100 && (
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ fontSize: "11.5px", padding: "4px 9px", background: "#ffffff" }}
                            onClick={() => setSettlePayAmount("100")}
                          >
                            +$100
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "10px 0" }}>
                      <span className="badge badge-green" style={{ fontSize: "13px", padding: "6px 14px" }}>
                        🎉 Fully Settled! All due amounts paid off.
                      </span>
                    </div>
                  )}

                  {settleSuccessMsg && (
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                      {settleSuccessMsg}
                    </div>
                  )}
                </div>

                {/* Detailed Breakdown List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13.5px" }}>
                  {detailLoan.type === "got" && (
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                      <span style={{ color: "#64748b" }}>Loan Method / Type:</span>
                      <strong>{loanTypeIcons[(currentLoan as GotLoan).type]} {(currentLoan as GotLoan).type}</strong>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>Monthly Interest Rate:</span>
                    <strong>{currentLoan.interestRate > 0 ? `${currentLoan.interestRate}% / mo (+${calculateMonthlyInterest(currentLoan.amount, currentLoan.interestRate).toFixed(2)})` : "0% (Interest Free)"}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>{detailLoan.type === "given" ? "Date Given:" : "Date Received:"}</span>
                    <strong>{currentLoan.date || "—"}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>Next Settlement Date:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>{currentLoan.nextSettlement || "—"}</strong>
                      {!currentLoan.settled && dueBadge(currentLoan.nextSettlement)}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>Final Return Date:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>{currentLoan.returnDate || "—"}</strong>
                      {!currentLoan.settled && dueBadge(currentLoan.returnDate)}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                    <span style={{ color: "#64748b" }}>Overall Status:</span>
                    {currentLoan.settled ? (
                      <span className="badge badge-green">✓ Fully Settled & Closed</span>
                    ) : (
                      <span className="badge badge-amber">⏳ Pending (${remainingDue.toFixed(2)} left)</span>
                    )}
                  </div>

                  <div>
                    <span style={{ color: "#64748b", display: "block", marginBottom: "4px" }}>Notes / Remarks:</span>
                    <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#0f172a" }}>
                      {currentLoan.notes || "No notes provided"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ justifyContent: "space-between" }}>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (detailLoan.type === "given") {
                      deleteGiven(currentLoan.id);
                    } else {
                      deleteGot(currentLoan.id);
                    }
                  }}
                >
                  🗑 Delete Loan
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary" onClick={() => setDetailLoan(null)}>
                    Done / Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══ GIVEN RECORD MODAL ══ */}
      {showGivenModal && (
        <div className="modal-overlay" onClick={() => setShowGivenModal(false)}>
          <div className="modal" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💸 Record Given Loan (You Lent)</h3>
              <button className="modal-close" onClick={() => setShowGivenModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Person / Borrower</label>
                  <input className="form-input" type="text" placeholder="e.g. Rahul, John" value={givenForm.person} onChange={(e) => setGivenForm({ ...givenForm, person: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Principal Amount ($)</label>
                  <input className="form-input" type="number" placeholder="0" min="1" style={{ width: "150px" }} value={givenForm.amount} onChange={(e) => setGivenForm({ ...givenForm, amount: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Date Given</label>
                  <input className="form-input" type="date" value={givenForm.date} onChange={(e) => setGivenForm({ ...givenForm, date: e.target.value })} />
                </div>
                <div className="form-group grow">
                  <label className="form-label">Monthly Interest Rate (% / month)</label>
                  <input className="form-input" type="number" placeholder="0" min="0" step="0.1" value={givenForm.interestRate} onChange={(e) => setGivenForm({ ...givenForm, interestRate: e.target.value })} />
                </div>
              </div>

              {/* Live Interest Calculation Box */}
              {givenFormAmount > 0 && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>CALCULATED MONTHLY INTEREST</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: givenFormRate > 0 ? "#059669" : "#64748b", marginTop: "2px" }}>
                      +${givenFormMonthlyInt.toFixed(2)} / month
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>TOTAL DUE AMOUNT (1 MO.)</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      ${(givenFormAmount + givenFormMonthlyInt).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Next Settlement Date</label>
                  <input className="form-input" type="date" value={givenForm.nextSettlement} onChange={(e) => setGivenForm({ ...givenForm, nextSettlement: e.target.value })} />
                </div>
                <div className="form-group grow">
                  <label className="form-label">Day of Return (Final Due)</label>
                  <input className="form-input" type="date" value={givenForm.returnDate} onChange={(e) => setGivenForm({ ...givenForm, returnDate: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" type="text" placeholder="e.g. Personal loan for college fees" value={givenForm.notes} onChange={(e) => setGivenForm({ ...givenForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowGivenModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addGiven}>Save Given Loan</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ GOT RECORD MODAL ══ */}
      {showGotModal && (
        <div className="modal-overlay" onClick={() => setShowGotModal(false)}>
          <div className="modal" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📥 Record Got Loan (You Borrowed)</h3>
              <button className="modal-close" onClick={() => setShowGotModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">From (Lender / Platform)</label>
                  <input className="form-input" type="text" placeholder="e.g. Koko, Instant Pay, Ravi" value={gotForm.person} onChange={(e) => setGotForm({ ...gotForm, person: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Principal Amount ($)</label>
                  <input className="form-input" type="number" placeholder="0" min="1" style={{ width: "150px" }} value={gotForm.amount} onChange={(e) => setGotForm({ ...gotForm, amount: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Loan Type (Method)</label>
                  <select className="form-select" value={gotForm.type} onChange={(e) => setGotForm({ ...gotForm, type: e.target.value as GotLoan["type"] })}>
                    {payTypes.map((t) => (
                      <option key={t} value={t}>{loanTypeIcons[t]} {t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group grow">
                  <label className="form-label">Monthly Interest Rate (% / month)</label>
                  <input className="form-input" type="number" placeholder="0" min="0" step="0.1" value={gotForm.interestRate} onChange={(e) => setGotForm({ ...gotForm, interestRate: e.target.value })} />
                </div>
              </div>

              {/* Live Interest Calculation Box */}
              {gotFormAmount > 0 && (
                <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11.5px", color: "#9f1239", fontWeight: 600 }}>CALCULATED MONTHLY INTEREST COST</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#e11d48", marginTop: "2px" }}>
                      -${gotFormMonthlyInt.toFixed(2)} / month
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11.5px", color: "#9f1239", fontWeight: 600 }}>TOTAL DUE AMOUNT (1 MO.)</div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                      ${(gotFormAmount + gotFormMonthlyInt).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group grow">
                  <label className="form-label">Date Received</label>
                  <input className="form-input" type="date" value={gotForm.date} onChange={(e) => setGotForm({ ...gotForm, date: e.target.value })} />
                </div>
                <div className="form-group grow">
                  <label className="form-label">Next Settlement Date</label>
                  <input className="form-input" type="date" value={gotForm.nextSettlement} onChange={(e) => setGotForm({ ...gotForm, nextSettlement: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Day of Return (Full Repayment Date)</label>
                <input className="form-input" type="date" value={gotForm.returnDate} onChange={(e) => setGotForm({ ...gotForm, returnDate: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" type="text" placeholder="e.g. Buy Now Pay Later via Koko 3 months" value={gotForm.notes} onChange={(e) => setGotForm({ ...gotForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowGotModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addGot}>Save Borrowed Loan</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Loans;
