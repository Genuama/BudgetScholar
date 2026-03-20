import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddBudget({ userId }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/categories/expenses", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setCategoryId(data[0]?.id || "");
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/add-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, category_id: categoryId, name, amount, period }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Failed to add budget");
        return;
      }
      setIsError(false);
      setMessage("Budget added!");
      setAmount("");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      setIsError(true);
      setMessage("Server error.");
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Add Budget</h2>
        <p className="form-subtitle">Set a spending limit for a category</p>
        <form onSubmit={handleSubmit}>
          <label>Budget Name</label>
          <input
            type="text"
            placeholder="e.g. Monthly Groceries"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Budget Amount ($)</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          <label>Period</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>

          {message && (
            <p className={isError ? "auth-error" : "auth-success"}>{message}</p>
          )}
          <button type="submit">Add Budget</button>
        </form>
      </div>
    </div>
  );
}
