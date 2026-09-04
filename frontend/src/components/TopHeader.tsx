interface TopHeaderProps {
  pageTitle: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatMonthDisplay(monthStr: string) {
  if (!monthStr) return "";
  try {
    const [year, month] = monthStr.split("-");
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return monthStr;
  }
}

function TopHeader({
  pageTitle,
  selectedDate,
  onDateChange,
  selectedMonth,
  onMonthChange,
}: TopHeaderProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onDateChange(val);
    if (val) {
      onMonthChange(val.slice(0, 7));
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onMonthChange(val);
    if (val) {
      // Set to 1st of that month or retain day
      const day = selectedDate ? selectedDate.slice(8) : "01";
      onDateChange(`${val}-${day}`);
    }
  };

  const stepDate = (days: number) => {
    const base = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    const newDate = `${yyyy}-${mm}-${dd}`;
    onDateChange(newDate);
    onMonthChange(`${yyyy}-${mm}`);
  };

  const setToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
    onMonthChange(`${yyyy}-${mm}`);
  };

  return (
    <header className="top-header">
      <div className="top-header-left">
        <div className="top-header-page-title">
          <span className="top-header-section-tag">Finance</span>
          <h2>{pageTitle}</h2>
        </div>
      </div>

      <div className="calendar-bar">
        {/* Navigation Arrows */}
        <button
          className="calendar-arrow-btn"
          onClick={() => stepDate(-1)}
          title="Previous day"
        >
          ◀
        </button>

        {/* Current Formatted Date & Badge */}
        <div className="calendar-active-date">
          <span className="calendar-icon">📅</span>
          <div className="calendar-date-text">
            <strong>{formatDateDisplay(selectedDate)}</strong>
            <span className="calendar-month-sub">{formatMonthDisplay(selectedMonth)}</span>
          </div>
        </div>

        {/* Date Finder Input */}
        <div className="calendar-input-group" title="Select exact date">
          <label className="calendar-label">Date:</label>
          <input
            type="date"
            className="calendar-input"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        {/* Month Finder Input */}
        <div className="calendar-input-group" title="Select month & year">
          <label className="calendar-label">Month:</label>
          <input
            type="month"
            className="calendar-input month"
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>

        <button
          className="calendar-arrow-btn"
          onClick={() => stepDate(1)}
          title="Next day"
        >
          ▶
        </button>

        {/* Quick Today Shortcut */}
        <button className="btn btn-sm btn-ghost calendar-today-btn" onClick={setToday}>
          Today
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
