import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  List,
} from "lucide-react";
import { api, type TransactionItem, type LoanItem } from "../services/api";

interface CalendarPageProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onNavigateToTransactions?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const categoryIcons: Record<string, string> = {
  Food: "🍔", "Food & Dining": "🍔", Transport: "🚌", Shopping: "🛍️",
  Bills: "📄", Entertainment: "🎬", Salary: "💰", Other: "📌",
};

export const CalendarPage = ({
  selectedDate,
  onDateChange,
  selectedMonth,
  onMonthChange,
  onNavigateToTransactions,
}: CalendarPageProps) => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "agenda">("grid");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");

  // Derive current viewing year and month
  const { viewYear, viewMonth } = useMemo(() => {
    if (selectedMonth && selectedMonth.includes("-")) {
      const [y, m] = selectedMonth.split("-").map(Number);
      return { viewYear: y, viewMonth: m - 1 };
    }
    const d = new Date();
    return { viewYear: d.getFullYear(), viewMonth: d.getMonth() };
  }, [selectedMonth]);

  // Load data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getTransactions().catch(() => [] as TransactionItem[]),
      api.getLoans().catch(() => [] as LoanItem[]),
    ])
      .then(([txData, loanData]) => {
        if (!isMounted) return;
        setTransactions(txData || []);
        setLoans(loanData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load calendar events:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMonth]);

  // Step Month
  const handlePrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    const yyyy = prev.getFullYear();
    const mm = String(prev.getMonth() + 1).padStart(2, "0");
    const newMonthStr = `${yyyy}-${mm}`;
    onMonthChange(newMonthStr);

    const safeDay = selectedDate ? selectedDate.slice(8) : "01";
    const maxDays = new Date(yyyy, prev.getMonth() + 1, 0).getDate();
    const validDay = String(Math.min(Number(safeDay) || 1, maxDays)).padStart(2, "0");
    onDateChange(`${newMonthStr}-${validDay}`);
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    const yyyy = next.getFullYear();
    const mm = String(next.getMonth() + 1).padStart(2, "0");
    const newMonthStr = `${yyyy}-${mm}`;
    onMonthChange(newMonthStr);

    const safeDay = selectedDate ? selectedDate.slice(8) : "01";
    const maxDays = new Date(yyyy, next.getMonth() + 1, 0).getDate();
    const validDay = String(Math.min(Number(safeDay) || 1, maxDays)).padStart(2, "0");
    onDateChange(`${newMonthStr}-${validDay}`);
  };

  const handleJumpToToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
    onMonthChange(`${yyyy}-${mm}`);
  };

  // Group transactions by date
  const txByDate = useMemo(() => {
    const map: Record<string, { income: number; expense: number; items: TransactionItem[] }> = {};

    transactions.forEach((tx) => {
      const dateKey = tx.date ? tx.date.split("T")[0] : "";
      if (!dateKey) return;

      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, items: [] };
      }

      map[dateKey].items.push(tx);
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") {
        map[dateKey].income += amt;
      } else {
        map[dateKey].expense += amt;
      }
    });

    return map;
  }, [transactions]);

  // Group loan settlements by next_settlement date
  const loansByDate = useMemo(() => {
    const map: Record<string, LoanItem[]> = {};
    loans.forEach((l) => {
      const dateKey = l.next_settlement || l.return_date || "";
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(l);
    });
    return map;
  }, [loans]);

  // Month Statistics
  const monthStats = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    let activeDays = 0;

    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

    Object.entries(txByDate).forEach(([dateStr, data]) => {
      if (dateStr.startsWith(prefix)) {
        totalExpense += data.expense;
        totalIncome += data.income;
        if (data.expense > 0 || data.income > 0) {
          activeDays++;
        }
      }
    });

    const netSavings = totalIncome - totalExpense;

    return {
      totalExpense,
      totalIncome,
      netSavings,
      activeDays,
    };
  }, [txByDate, viewYear, viewMonth]);

  // Generate calendar days for the full month view
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startingDayOfWeek = firstDay.getDay() - 1; // 0=Mon, 6=Sun
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      income: number;
      expense: number;
      txCount: number;
      loanCount: number;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNumber);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dd = String(dayNumber).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayTx = txByDate[dateStr];
      const dayLoans = loansByDate[dateStr];

      days.push({
        dateStr,
        dayNumber,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        income: dayTx?.income || 0,
        expense: dayTx?.expense || 0,
        txCount: dayTx?.items?.length || 0,
        loanCount: dayLoans?.length || 0,
      });
    }

    // Current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const mm = String(viewMonth + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateStr = `${viewYear}-${mm}-${dd}`;

      const dayTx = txByDate[dateStr];
      const dayLoans = loansByDate[dateStr];

      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        income: dayTx?.income || 0,
        expense: dayTx?.expense || 0,
        txCount: dayTx?.items?.length || 0,
        loanCount: dayLoans?.length || 0,
      });
    }

    // Leading days
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(viewYear, viewMonth + 1, day);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayTx = txByDate[dateStr];
      const dayLoans = loansByDate[dateStr];

      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        income: dayTx?.income || 0,
        expense: dayTx?.expense || 0,
        txCount: dayTx?.items?.length || 0,
        loanCount: dayLoans?.length || 0,
      });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate, txByDate, loansByDate]);

  // Selected Day data
  const selectedDayTx = txByDate[selectedDate]?.items || [];
  const filteredSelectedTx = selectedDayTx.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });
  const selectedDayLoans = loansByDate[selectedDate] || [];

  const formatSelectedDateLong = (str: string) => {
    if (!str) return "";
    try {
      const d = new Date(str + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return str;
    }
  };

  return (
    <div className="cal-page-layout">
      {/* Calendar Header / Controls Bar */}
      <div className="cal-page-header">
        <div className="cal-header-left">
          <div className="cal-header-title-badge">
            <CalendarIcon size={20} className="cal-icon-glow" />
            <div>
              <h1 className="cal-page-heading">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h1>
              <p className="cal-page-sub">
                {loading ? "Syncing financial events…" : "Track your financial timeline, cashflow cadence, and bill settlements"}
              </p>
            </div>
          </div>
        </div>

        <div className="cal-header-controls">
          <div className="cal-btn-group">
            <button
              type="button"
              className="btn btn-sm btn-outline cal-nav-circle"
              onClick={handlePrevMonth}
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleJumpToToday}
            >
              <Clock size={13} style={{ marginRight: 5 }} />
              Today
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline cal-nav-circle"
              onClick={handleNextMonth}
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cal-view-toggle">
            <button
              type="button"
              className={`cal-toggle-pill ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <CalendarDays size={14} />
              <span>Grid View</span>
            </button>
            <button
              type="button"
              className={`cal-toggle-pill ${viewMode === "agenda" ? "active" : ""}`}
              onClick={() => setViewMode("agenda")}
            >
              <List size={14} />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month Stats Ribbon */}
      <div className="cal-stats-ribbon">
        <div className="cal-stat-card income">
          <div className="cal-stat-icon-wrap income">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="cal-stat-label">Month Income</span>
            <strong className="cal-stat-value text-success">
              +${monthStats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="cal-stat-card expense">
          <div className="cal-stat-icon-wrap expense">
            <TrendingDown size={18} />
          </div>
          <div>
            <span className="cal-stat-label">Month Expenses</span>
            <strong className="cal-stat-value text-danger">
              -${monthStats.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="cal-stat-card net">
          <div className="cal-stat-icon-wrap net">
            <DollarSign size={18} />
          </div>
          <div>
            <span className="cal-stat-label">Net Balance</span>
            <strong
              className={`cal-stat-value ${
                monthStats.netSavings >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {monthStats.netSavings >= 0 ? "+" : ""}$
              {monthStats.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        <div className="cal-stat-card days">
          <div className="cal-stat-icon-wrap days">
            <CalendarIcon size={18} />
          </div>
          <div>
            <span className="cal-stat-label">Active Days</span>
            <strong className="cal-stat-value text-primary">
              {monthStats.activeDays} days recorded
            </strong>
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid + Selected Day Drawer */}
      <div className="cal-main-content">
        {/* Left/Main Column: The Grid */}
        <div className="cal-grid-container">
          {viewMode === "grid" ? (
            <>
              {/* Day Headers */}
              <div className="cal-grid-header-row">
                {SHORT_WEEKDAYS.map((day, idx) => (
                  <div key={day} className="cal-grid-header-col">
                    <span className="cal-grid-header-short">{day}</span>
                    <span className="cal-grid-header-full">{WEEKDAYS[idx]}</span>
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="cal-month-grid">
                {calendarDays.map((cell) => (
                  <div
                    key={cell.dateStr}
                    className={`cal-cell ${
                      !cell.isCurrentMonth ? "cal-cell-muted" : ""
                    } ${cell.isToday ? "cal-cell-today" : ""} ${
                      cell.isSelected ? "cal-cell-selected" : ""
                    }`}
                    onClick={() => onDateChange(cell.dateStr)}
                  >
                    <div className="cal-cell-top">
                      <span className="cal-cell-num">{cell.dayNumber}</span>
                      {cell.isToday && <span className="cal-badge-today">Today</span>}
                      {cell.txCount > 0 && (
                        <span className="cal-cell-txcount" title={`${cell.txCount} transactions`}>
                          {cell.txCount}
                        </span>
                      )}
                    </div>

                    <div className="cal-cell-events">
                      {cell.income > 0 && (
                        <div className="cal-pill income" title={`Income: +$${cell.income}`}>
                          <ArrowUpRight size={10} />
                          <span>+${Math.round(cell.income)}</span>
                        </div>
                      )}
                      {cell.expense > 0 && (
                        <div className="cal-pill expense" title={`Expense: -$${cell.expense}`}>
                          <ArrowDownRight size={10} />
                          <span>-${Math.round(cell.expense)}</span>
                        </div>
                      )}
                      {cell.loanCount > 0 && (
                        <div className="cal-pill loan" title="Loan settlement due">
                          <CreditCard size={10} />
                          <span>Loan Due</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Agenda View */
            <div className="cal-agenda-view">
              <div className="cal-agenda-header">
                <h3>{MONTH_NAMES[viewMonth]} Financial Timeline</h3>
                <span className="cal-agenda-count">
                  {Object.keys(txByDate).filter((k) => k.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)).length} active dates
                </span>
              </div>

              <div className="cal-agenda-list">
                {calendarDays
                  .filter((c) => c.isCurrentMonth && (c.income > 0 || cellHasExpense(c) || c.loanCount > 0))
                  .map((c) => {
                    const items = txByDate[c.dateStr]?.items || [];
                    return (
                      <div
                        key={c.dateStr}
                        className={`cal-agenda-item ${c.isSelected ? "selected" : ""}`}
                        onClick={() => onDateChange(c.dateStr)}
                      >
                        <div className="cal-agenda-date">
                          <span className="cal-agenda-daynum">{c.dayNumber}</span>
                          <span className="cal-agenda-dayname">
                            {new Date(c.dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                        </div>

                        <div className="cal-agenda-events-summary">
                          {items.map((item) => (
                            <div key={item.id} className="cal-agenda-tx-row">
                              <span className="cal-agenda-cat-icon">
                                {categoryIcons[item.category] || "📌"}
                              </span>
                              <span className="cal-agenda-tx-desc">{item.description}</span>
                              <span
                                className={`cal-agenda-tx-amt ${
                                  item.type === "income" ? "text-success" : "text-danger"
                                }`}
                              >
                                {item.type === "income" ? "+" : "-"}${Number(item.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Day Breakdown Drawer */}
        <div className="cal-day-drawer">
          <div className="cal-drawer-header">
            <div className="cal-drawer-date-info">
              <span className="cal-drawer-tag">Selected Date</span>
              <h2 className="cal-drawer-title">{formatSelectedDateLong(selectedDate)}</h2>
            </div>
            {selectedDate === new Date().toISOString().split("T")[0] && (
              <span className="cal-today-pill">Today</span>
            )}
          </div>

          {/* Daily Totals Bar */}
          <div className="cal-drawer-totals">
            <div className="cal-drawer-total-box income">
              <span>Income</span>
              <strong>
                +${(txByDate[selectedDate]?.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="cal-drawer-total-box expense">
              <span>Expenses</span>
              <strong>
                -${(txByDate[selectedDate]?.expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="cal-drawer-filter-bar">
            <div className="cal-filter-chips">
              <button
                type="button"
                className={`cal-filter-chip ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All ({selectedDayTx.length})
              </button>
              <button
                type="button"
                className={`cal-filter-chip ${filterType === "expense" ? "active" : ""}`}
                onClick={() => setFilterType("expense")}
              >
                Expenses
              </button>
              <button
                type="button"
                className={`cal-filter-chip ${filterType === "income" ? "active" : ""}`}
                onClick={() => setFilterType("income")}
              >
                Income
              </button>
            </div>
          </div>

          {/* Transaction items list for selected day */}
          <div className="cal-drawer-list">
            {filteredSelectedTx.length > 0 ? (
              filteredSelectedTx.map((tx) => (
                <div key={tx.id} className="cal-tx-card">
                  <div className="cal-tx-icon-col">
                    <span className="cal-tx-cat-badge">
                      {categoryIcons[tx.category] || "💸"}
                    </span>
                  </div>
                  <div className="cal-tx-details">
                    <span className="cal-tx-desc">{tx.description}</span>
                    <span className="cal-tx-cat-name">{tx.category}</span>
                  </div>
                  <div className="cal-tx-amt-col">
                    <strong
                      className={`cal-tx-amount ${
                        tx.type === "income" ? "text-success" : "text-danger"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="cal-drawer-empty">
                <CalendarIcon size={32} className="cal-empty-icon" />
                <h4>No transactions on this date</h4>
                <p>Enjoy your zero-spend day or record a transaction below.</p>
              </div>
            )}

            {/* Loan dues on this date if any */}
            {selectedDayLoans.length > 0 && (
              <div className="cal-drawer-loans-section">
                <h4 className="cal-loans-title">
                  <CreditCard size={14} />
                  <span>Settlements Due Today</span>
                </h4>
                {selectedDayLoans.map((loan) => (
                  <div key={loan.id} className="cal-loan-due-card">
                    <div>
                      <strong>{loan.person}</strong>
                      <span className="cal-loan-type">
                        {loan.loan_direction === "got" ? "Borrowed from" : "Lent to"}
                      </span>
                    </div>
                    <strong className="text-warning">${Number(loan.amount).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          {onNavigateToTransactions && (
            <div className="cal-drawer-footer">
              <button
                type="button"
                className="btn btn-primary btn-block cal-add-tx-btn"
                onClick={onNavigateToTransactions}
              >
                Go to Transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cellHasExpense(c: { expense: number }) {
  return c.expense > 0;
}

export default CalendarPage;
