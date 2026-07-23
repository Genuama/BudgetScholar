import { useNavigate } from "react-router-dom";

export default function Navbar({ name, username, onLogout, onMenuClick }) {
  const navigate = useNavigate();
  const displayName = name || username;

  async function handleLogout() {
    await fetch("/logout", { method: "POST", credentials: "include" });
    onLogout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <button className="menu-toggle" onClick={onMenuClick}>☰</button>
      <div className="navbar-brand">BudgetScholar</div>
      <div className="navbar-right">
        <span className="navbar-user">Hello, {displayName} 👋</span>
        <div className="navbar-avatar">{displayName?.[0]?.toUpperCase()}</div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
