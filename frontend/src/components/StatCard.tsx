interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: "blue" | "green" | "red" | "purple";
  change?: string;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <p>{title}</p>
      <h2>{value}</h2>
      {change && <div className="stat-card-change">{change}</div>}
    </div>
  );
}

export default StatCard;
