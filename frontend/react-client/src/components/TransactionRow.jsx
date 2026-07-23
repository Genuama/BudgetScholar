import { useState, useEffect } from "react";

export default function TransactionRow({ transaction, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [amount, setAmount] = useState(transaction.amount);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    fetch(`/categories/${type}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setCategoryId(prev =>
          data.some(c => String(c.id) === String(prev)) ? prev : (data[0]?.id || "")
        );
      });
  }, [editing, type]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/transactions/${transaction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, category_id: categoryId, amount }),
      credentials: "include"
    });
    setSaving(false);
    setEditing(false);
    onChanged();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this transaction?")) return;
    await fetch(`/transactions/${transaction.id}`, { method: "DELETE", credentials: "include" });
    onChanged();
  }

  if (editing) {
    return (
      <tr>
        <td>{new Date(transaction.date).toLocaleDateString()}</td>
        <td>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </td>
        <td>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expenses">Expenses</option>
          </select>
        </td>
        <td>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="inline-amount-input"
          />
        </td>
        <td>
          <div className="row-actions">
            <button className="icon-btn" onClick={handleSave} disabled={saving}>Save</button>
            <button className="icon-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{new Date(transaction.date).toLocaleDateString()}</td>
      <td>{transaction.category}</td>
      <td>
        <span className={`badge ${transaction.type}`}>{transaction.type}</span>
      </td>
      <td className={transaction.type === "income" ? "amount-income" : "amount-expense"}>
        {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
      </td>
      <td>
        <div className="row-actions">
          <button className="icon-btn" onClick={() => setEditing(true)}>Edit</button>
          <button className="icon-btn danger" onClick={handleDelete}>Delete</button>
        </div>
      </td>
    </tr>
  );
}
