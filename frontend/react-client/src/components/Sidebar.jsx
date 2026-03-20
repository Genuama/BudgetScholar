import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/add-transaction", icon: "💸", label: "Add Transaction" },
  { to: "/add-budget", icon: "🎯", label: "Add Budget" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Menu</div>
      <div className="sidebar-section">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
          >
            <span className="sidebar-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
