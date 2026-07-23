import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Something went wrong");
        return;
      }
      setIsError(false);
      setMessage(data.message);
      setSubmitted(true);
    } catch {
      setIsError(true);
      setMessage("Server error. Is the backend running?");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>BudgetScholar</h1>
        <p className="auth-subtitle">Reset your password</p>
        {!submitted && (
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send reset link</button>
          </form>
        )}
        {message && (
          <p className={isError ? "auth-error" : "auth-success"}>{message}</p>
        )}
        <p className="auth-link">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
