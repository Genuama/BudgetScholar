import { useState, useEffect } from "react";

export default function BudgetProgressCard({ budget, onChanged }) {
  const { budget_id, budget_name, category, category_id, budget_amount, spent, period } = budget;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(budget_name);
  const [categoryId, setCategoryId] = useState(category_id);
  const [amount, setAmount] = useState(budget_amount);
  const [periodVal, setPeriodVal] = useState(period);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    fetch("/categories/expenses", { credentials: "include" })
      .then(r => r.json())
      .then(setCategories);
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/budgets/${budget_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, amount, period: periodVal, name }),
      credentials: "include"
    });
    setSaving(false);
    setEditing(false);
    onChanged();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this budget?")) return;
    await fetch(`/budgets/${budget_id}`, { method: "DELETE", credentials: "include" });
    onChanged();
  }

  if (editing) {
    return (
      <div className="budget-card">
        <div className="budget-edit-fields">
          <input
            type="text"
            placeholder="Budget name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <select value={periodVal} onChange={e => setPeriodVal(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
          <div className="row-actions">
            <button className="icon-btn" onClick={handleSave} disabled={saving}>Save</button>
            <button className="icon-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const spentNum = Number(spent);
  const budgetAmountNum = Number(budget_amount);
  const remaining = budgetAmountNum - spentNum;
  const pct = Math.min((spentNum / budgetAmountNum) * 100, 100);
  const over = spentNum > budgetAmountNum;
  const warning = !over && pct >= 75;

  let fillClass = "";
  if (over) fillClass = "over";
  else if (warning) fillClass = "warning";

  const statusLabel = over
    ? `$${Math.abs(remaining).toFixed(2)} over`
    : `$${remaining.toFixed(2)} left`;

  const statusClass = over ? "over" : warning ? "warn" : "ok";

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div className="budget-card-title">
          <span className="budget-category">{budget_name || category}</span>
          {budget_name && <span className="budget-sub">{category}</span>}
        </div>
        <span className={`budget-period ${over ? "over-period" : ""}`}>{period}</span>
      </div>
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="budget-card-footer">
        <span className="budget-spent">${Number(spent).toFixed(2)} spent</span>
        <span className={`budget-status ${statusClass}`}>{statusLabel}</span>
        <span className="budget-of">of ${Number(budget_amount).toFixed(2)}</span>
      </div>
      <div className="row-actions budget-card-actions">
        <button className="icon-btn" onClick={() => setEditing(true)}>Edit</button>
        <button className="icon-btn danger" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
