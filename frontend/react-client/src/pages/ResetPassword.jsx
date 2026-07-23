import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords don't match");
      return;
    }

    try {
      const res = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Failed to reset password");
        return;
      }
      setIsError(false);
      setMessage("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setIsError(true);
      setMessage("Server error. Is the backend running?");
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>BudgetScholar</h1>
          <p className="auth-error">
            This reset link is missing its token. Request a new one from the{" "}
            <Link to="/forgot-password">forgot password</Link> page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>BudgetScholar</h1>
        <p className="auth-subtitle">Set a new password</p>
        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {message && (
            <p className={isError ? "auth-error" : "auth-success"}>{message}</p>
          )}
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
