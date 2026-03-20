import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddTransaction({ userId }) {
  const [type, setType] = useState("income");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/categories/${type}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setCategoryId(data[0]?.id || "");
      });
  }, [type]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/add-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, type, category_id: categoryId, amount }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "Failed to add transaction");
        return;
      }
      setIsError(false);
      setMessage("Transaction added!");
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
        <h2>Add Transaction</h2>
        <p className="form-subtitle">Record your income or an expense</p>
        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expenses">Expenses</option>
          </select>

          <label>Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Amount ($)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          {message && (
            <p className={isError ? "auth-error" : "auth-success"}>{message}</p>
          )}
          <button type="submit">Add Transaction</button>
        </form>
      </div>
    </div>
  );
}
