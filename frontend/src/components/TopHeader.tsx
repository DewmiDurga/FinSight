import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
} from "lucide-react";
import { CalendarPopover } from "./CalendarPopover";

interface TopHeaderProps {
  pageTitle: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onNavigateToCalendar?: () => void;
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
  onNavigateToCalendar,
}: TopHeaderProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

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

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;

  return (
    <header className="top-header">
      <div className="top-header-left">
        <div className="top-header-page-title">
          <span className="top-header-section-tag">Finance Command</span>
          <h2>{pageTitle}</h2>
        </div>
      </div>

      <div className="calendar-widget-container">
        <div className="calendar-bar">
          {/* Previous day stepper */}
          <button
            type="button"
            className="calendar-arrow-btn"
            onClick={() => stepDate(-1)}
            title="Previous day"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Interactive Date Trigger Button */}
          <button
            type="button"
            className={`calendar-active-date-btn ${isPopoverOpen ? "active" : ""}`}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            title="Click to open interactive calendar"
            aria-label="Open calendar"
          >
            <div className="calendar-icon-badge">
              <CalendarIcon size={16} />
            </div>
            <div className="calendar-date-text">
              <div className="calendar-date-row">
                <strong>{formatDateDisplay(selectedDate)}</strong>
                {isToday && <span className="calendar-today-badge">Today</span>}
              </div>
              <span className="calendar-month-sub">{formatMonthDisplay(selectedMonth)}</span>
            </div>
            <ChevronDown
              size={14}
              className={`calendar-chevron-icon ${isPopoverOpen ? "rotated" : ""}`}
            />
          </button>

          {/* Next day stepper */}
          <button
            type="button"
            className="calendar-arrow-btn"
            onClick={() => stepDate(1)}
            title="Next day"
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>

          {/* Quick Today Shortcut */}
          <button
            type="button"
            className={`btn btn-sm ${isToday ? "btn-outline" : "btn-primary"} calendar-today-btn`}
            onClick={setToday}
            title="Jump to today"
          >
            <Clock size={12} style={{ marginRight: 4 }} />
            Today
          </button>

          {/* Full Calendar View Shortcut */}
          {onNavigateToCalendar && (
            <button
              type="button"
              className="calendar-fullview-btn"
              onClick={onNavigateToCalendar}
              title="Open full-screen financial calendar"
            >
              <CalendarDays size={15} />
              <span>Full View</span>
            </button>
          )}
        </div>

        {/* Popover Dropdown */}
        <CalendarPopover
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onOpenCalendarView={onNavigateToCalendar}
        />
      </div>
    </header>
  );
}

export default TopHeader;
