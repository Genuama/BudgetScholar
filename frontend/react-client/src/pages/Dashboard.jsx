import { useEffect, useState } from "react";
import BalanceCard from "../components/cards/BalanceCard";
import BudgetProgressCard from "../components/cards/BudgetProgessCard";

async function fetchJson(url) {
  const res = await fetch(url, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request to ${url} failed`);
  return data;
}

export default function Dashboard({ userId }) {
  const [balance, setBalance] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetchJson(`/balance/${userId}`),
      fetchJson(`/budget-summary/${userId}`),
      fetchJson(`/transactions/${userId}`)
    ]).then(([bal, bud, txn]) => {
      setBalance(bal);
      setBudgets(bud);
      setTransactions(txn);
      setLoading(false);
    }).catch(err => {
      setError(err.message || "Failed to load dashboard data");
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div className="loading">✨ Loading your dashboard...</div>;

  if (error) return <div className="empty-msg">⚠️ {error}</div>;

  const savingsRate = balance.total_income > 0
    ? Math.round(((balance.total_income - balance.total_expenses) / balance.total_income) * 100)
    : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="page-title">Your Overview</h2>
        <p className="page-subtitle">
          {savingsRate >= 20
            ? `🎉 Amazing! You're saving ${savingsRate}% of your income.`
            : savingsRate > 0
            ? `💪 You're saving ${savingsRate}% of your income — keep going!`
            : `🚀 Start tracking your spending to hit your goals.`}
        </p>
      </div>

      <BalanceCard
        income={balance.total_income}
        expenses={balance.total_expenses}
      />

      <h3 className="section-title">Budget Progress</h3>

      {budgets.length === 0 ? (
        <p className="empty-msg">No budgets set yet. <a href="/add-budget">Add one</a>.</p>
      ) : (
        <div className="budget-grid">
          {budgets.map(b => (
            <BudgetProgressCard key={b.budget_id} budget={b} />
          ))}
        </div>
      )}

      <h3 className="section-title">Recent Transactions</h3>

      {transactions.length === 0 ? (
        <p className="empty-msg">No transactions yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td className={t.type === "income" ? "amount-income" : "amount-expense"}>
                    {t.type === "income" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
