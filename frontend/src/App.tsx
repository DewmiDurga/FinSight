import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import Auth from "./pages/Auth";
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
import CalendarPage from "./pages/CalendarPage";

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  calendar: "Financial Calendar",
  budgets: "Budgets",
  goals: "Savings Goals",
  analytics: "Analytics & Breakdown",
  loans: "Loans & Credit",
  assistant: "AI Assistant",
};

interface MainAppProps {
  userDisplayName: string;
  onSignOut: () => void;
}

function MainApp({ userDisplayName, onSignOut }: MainAppProps) {
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
      case "calendar":
        return (
          <CalendarPage
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onNavigateToTransactions={() => setPage("transactions")}
          />
        );
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
      <Sidebar
        page={page}
        setPage={setPage}
        userDisplayName={userDisplayName}
        onSignOut={onSignOut}
      />

      <div className="app-main">
        {/* Global interactive Calendar bar on every single page */}
        <TopHeader
          pageTitle={pageTitles[page]}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onNavigateToCalendar={() => setPage("calendar")}
        />

        <div className="app-content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { session, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading FinSight…</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Derive a display name: prefer full_name from metadata, fall back to email prefix
  const userDisplayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "User";

  return <MainApp userDisplayName={userDisplayName} onSignOut={signOut} />;
}

export default App;
