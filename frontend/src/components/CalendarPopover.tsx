import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  ExternalLink,
  RotateCcw,
  X,
} from "lucide-react";

interface CalendarPopoverProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenCalendarView?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const CalendarPopover = ({
  selectedDate,
  onDateChange,
  selectedMonth,
  onMonthChange,
  isOpen,
  onClose,
  onOpenCalendarView,
}: CalendarPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current view year and month from selectedMonth (or fallback to selectedDate)
  const initialYearMonth = () => {
    if (selectedMonth && selectedMonth.includes("-")) {
      const [y, m] = selectedMonth.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    if (selectedDate && selectedDate.includes("-")) {
      const [y, m] = selectedDate.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  };

  const [viewState, setViewState] = useState(initialYearMonth);
  const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days");

  // Synchronize internal viewState when selectedMonth changes
  useEffect(() => {
    if (selectedMonth && selectedMonth.includes("-")) {
      const [y, m] = selectedMonth.split("-").map(Number);
      setViewState({ year: y, month: m - 1 });
    }
  }, [selectedMonth]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { year: viewYear, month: viewMonth } = viewState;

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewState({ year: viewYear - 1, month: 11 });
    } else {
      setViewState({ year: viewYear, month: viewMonth - 1 });
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewState({ year: viewYear + 1, month: 0 });
    } else {
      setViewState({ year: viewYear, month: viewMonth + 1 });
    }
  };

  const handleSelectDay = (dateString: string) => {
    onDateChange(dateString);
    const monthStr = dateString.slice(0, 7);
    if (monthStr !== selectedMonth) {
      onMonthChange(monthStr);
    }
    onClose();
  };

  const handleSelectMonth = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const newMonthStr = `${viewYear}-${mm}`;
    onMonthChange(newMonthStr);

    // Keep day or default to 01
    const day = selectedDate ? selectedDate.slice(8) : "01";
    // Ensure day is valid for this month
    const maxDays = new Date(viewYear, monthIndex + 1, 0).getDate();
    const safeDay = String(Math.min(Number(day) || 1, maxDays)).padStart(2, "0");
    onDateChange(`${newMonthStr}-${safeDay}`);

    setViewState({ year: viewYear, month: monthIndex });
    setPickerMode("days");
  };

  const handleSelectYear = (year: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const newMonthStr = `${year}-${mm}`;
    onMonthChange(newMonthStr);

    const day = selectedDate ? selectedDate.slice(8) : "01";
    const maxDays = new Date(year, viewMonth + 1, 0).getDate();
    const safeDay = String(Math.min(Number(day) || 1, maxDays)).padStart(2, "0");
    onDateChange(`${newMonthStr}-${safeDay}`);

    setViewState({ year, month: viewMonth });
    setPickerMode("months");
  };

  // Quick preset shortcuts
  const applyPreset = (preset: "today" | "yesterday" | "start_month" | "end_month") => {
    const now = new Date();
    let target = new Date();

    if (preset === "today") {
      target = now;
    } else if (preset === "yesterday") {
      target.setDate(now.getDate() - 1);
    } else if (preset === "start_month") {
      target = new Date(viewYear, viewMonth, 1);
    } else if (preset === "end_month") {
      target = new Date(viewYear, viewMonth + 1, 0);
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const monthStr = `${yyyy}-${mm}`;

    onDateChange(dateStr);
    onMonthChange(monthStr);
    setViewState({ year: yyyy, month: target.getMonth() });
    onClose();
  };

  // Generate day grid cells (Monday-first)
  const generateDays = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNumber);
      const yyyy = prevDate.getFullYear();
      const mm = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dd = String(dayNumber).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      cells.push({
        dateStr,
        dayNumber,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const mm = String(viewMonth + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateStr = `${viewYear}-${mm}-${dd}`;

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }

    // Next month leading days to complete 35 or 42 grid
    const totalSlots = cells.length <= 35 ? 35 : 42;
    const remaining = totalSlots - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(viewYear, viewMonth + 1, day);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }

    return cells;
  };

  const days = generateDays();
  const todayStr = new Date().toISOString().split("T")[0];
  const isSelectedToday = selectedDate === todayStr;

  // Formatted display
  const formatHeaderDate = (str: string) => {
    if (!str) return "";
    try {
      const d = new Date(str + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return str;
    }
  };

  return (
    <div className="calendar-popover-anchor">
      <div className="calendar-popover" ref={popoverRef}>
        {/* Top Header inside popover */}
        <div className="cal-pop-header">
          <div className="cal-pop-title-area">
            <span className="cal-pop-badge">
              <CalendarIcon size={13} />
              <span>Date Navigator</span>
            </span>
            <div className="cal-pop-active-display">
              <strong>{formatHeaderDate(selectedDate)}</strong>
              {isSelectedToday && <span className="cal-today-pill">Today</span>}
            </div>
          </div>
          <button
            type="button"
            className="cal-close-btn"
            onClick={onClose}
            title="Close calendar"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Presets Row */}
        <div className="cal-presets-row">
          <button
            type="button"
            className={`cal-preset-btn ${isSelectedToday ? "active" : ""}`}
            onClick={() => applyPreset("today")}
          >
            <Clock size={12} /> Today
          </button>
          <button
            type="button"
            className="cal-preset-btn"
            onClick={() => applyPreset("yesterday")}
          >
            Yesterday
          </button>
          <button
            type="button"
            className="cal-preset-btn"
            onClick={() => applyPreset("start_month")}
          >
            Month Start
          </button>
          <button
            type="button"
            className="cal-preset-btn"
            onClick={() => applyPreset("end_month")}
          >
            Month End
          </button>
        </div>

        {/* Month & Year Navigation Bar */}
        <div className="cal-nav-bar">
          <button
            type="button"
            className="cal-nav-arrow"
            onClick={handlePrevMonth}
            title="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="cal-nav-selectors">
            <button
              type="button"
              className={`cal-selector-btn ${pickerMode === "months" ? "active" : ""}`}
              onClick={() => setPickerMode(pickerMode === "months" ? "days" : "months")}
            >
              {MONTH_NAMES[viewMonth]}
            </button>
            <button
              type="button"
              className={`cal-selector-btn ${pickerMode === "years" ? "active" : ""}`}
              onClick={() => setPickerMode(pickerMode === "years" ? "days" : "years")}
            >
              {viewYear}
            </button>
          </div>

          <button
            type="button"
            className="cal-nav-arrow"
            onClick={handleNextMonth}
            title="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content View: Days Grid, Months Grid, or Years Grid */}
        {pickerMode === "days" && (
          <div className="cal-grid-wrapper">
            {/* Day name headers */}
            <div className="cal-weekdays-row">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="cal-weekday-label">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="cal-days-grid">
              {days.map((item) => (
                <button
                  type="button"
                  key={item.dateStr}
                  className={`cal-day-cell ${
                    !item.isCurrentMonth ? "other-month" : ""
                  } ${item.isToday ? "is-today" : ""} ${
                    item.isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => handleSelectDay(item.dateStr)}
                  title={item.dateStr}
                >
                  <span className="cal-day-num">{item.dayNumber}</span>
                  {item.isToday && !item.isSelected && (
                    <span className="cal-today-dot" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {pickerMode === "months" && (
          <div className="cal-months-grid">
            {MONTH_NAMES.map((name, idx) => {
              const isCurrent = idx === viewMonth;
              return (
                <button
                  type="button"
                  key={name}
                  className={`cal-month-tile ${isCurrent ? "is-selected" : ""}`}
                  onClick={() => handleSelectMonth(idx)}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>
        )}

        {pickerMode === "years" && (
          <div className="cal-years-grid">
            {Array.from({ length: 12 }, (_, i) => viewYear - 5 + i).map((yr) => (
              <button
                type="button"
                key={yr}
                className={`cal-year-tile ${yr === viewYear ? "is-selected" : ""}`}
                onClick={() => handleSelectYear(yr)}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        {/* Popover Footer */}
        <div className="cal-pop-footer">
          <button
            type="button"
            className="cal-footer-today-btn"
            onClick={() => applyPreset("today")}
          >
            <RotateCcw size={13} />
            <span>Today</span>
          </button>

          {onOpenCalendarView && (
            <button
              type="button"
              className="cal-footer-fullview-btn"
              onClick={() => {
                onClose();
                onOpenCalendarView();
              }}
            >
              <CalendarDays size={13} />
              <span>Full Calendar View</span>
              <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
