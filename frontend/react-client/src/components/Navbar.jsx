import { useNavigate } from "react-router-dom";

export default function Navbar({ username, onLogout }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await fetch("/logout", { method: "POST", credentials: "include" });
    onLogout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">BudgetScholar</div>
      <div className="navbar-right">
        <span className="navbar-user">Hello, {username} 👋</span>
        <div className="navbar-avatar">{username?.[0]?.toUpperCase()}</div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}
