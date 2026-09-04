type Page =
  | "dashboard"
  | "transactions"
  | "budgets"
  | "goals"
  | "analytics"
  | "loans"
  | "assistant";

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
}

const financeLinks: { label: string; id: Page; icon: string }[] = [
  { label: "Dashboard",    id: "dashboard",    icon: "📊" },
  { label: "Transactions", id: "transactions", icon: "💳" },
  { label: "Budgets",      id: "budgets",      icon: "🎯" },
  { label: "Goals",        id: "goals",        icon: "🏆" },
  { label: "Analytics",    id: "analytics",    icon: "📈" },
  { label: "Loans",        id: "loans",        icon: "🤝" },
];

const toolLinks: { label: string; id: Page; icon: string }[] = [
  { label: "AI Assistant", id: "assistant",    icon: "🤖" },
];

function Sidebar({ page, setPage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>💹 FinSight</h2>
        <p>Personal Finance Tracker</p>
      </div>

      <nav>
        <div className="sidebar-section-label">Finance</div>

        {financeLinks.map((link) => (
          <button
            key={link.id}
            className={page === link.id ? "nav-link active" : "nav-link"}
            onClick={() => setPage(link.id)}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}

        <div className="sidebar-section-label">Tools</div>

        {toolLinks.map((link) => (
          <button
            key={link.id}
            className={page === link.id ? "nav-link active" : "nav-link"}
            onClick={() => setPage(link.id)}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        FinSight v1.0
      </div>
    </aside>
  );
}

export type { Page };
export default Sidebar;
