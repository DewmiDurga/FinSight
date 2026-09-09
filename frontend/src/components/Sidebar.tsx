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
  userDisplayName: string;
  onSignOut: () => void;
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

function Sidebar({ page, setPage, userDisplayName, onSignOut }: SidebarProps) {
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

      {/* User info + logout */}
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-text">
            <span className="sidebar-user-name">{userDisplayName}</span>
            <span className="sidebar-user-role">Account</span>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          className="sidebar-logout-btn"
          onClick={onSignOut}
          title="Sign out"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}

export type { Page };
export default Sidebar;
