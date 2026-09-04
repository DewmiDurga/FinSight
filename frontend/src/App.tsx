import { useState } from "react";
import Sidebar from "./components/Sidebar";
import type { Page } from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Loans from "./pages/Loans";
import Assistant from "./pages/Assistant";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  budgets: "Budgets",
  goals: "Savings Goals",
  analytics: "Analytics & Breakdown",
  loans: "Loans & Credit",
  assistant: "AI Assistant",
};

function App() {
  const [page, setPage] = useState<Page>("dashboard");

  // Global Calendar selector state (defaults to today)
  const today = new Date();
  const defaultDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const defaultMonth = defaultDate.slice(0, 7);           // YYYY-MM

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard selectedDate={selectedDate} selectedMonth={selectedMonth} />;
      case "transactions":
        return <Transactions selectedDate={selectedDate} selectedMonth={selectedMonth} />;
      case "budgets":
        return <Budgets />;
      case "goals":
        return <Goals />;
      case "analytics":
        return <Analytics />;
      case "loans":
        return <Loans selectedDate={selectedDate} selectedMonth={selectedMonth} />;
      case "assistant":
        return <Assistant />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} />

      <div className="app-main">
        {/* Global interactive Calendar bar on every single page */}
        <TopHeader
          pageTitle={pageTitles[page]}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <div className="app-content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
