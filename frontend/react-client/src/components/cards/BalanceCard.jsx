export default function BalanceCard({ income, expenses }) {
  const balance = income - expenses;

  return (
    <div className="balance-hero">
      <div className="balance-hero-label">Net Balance</div>
      <div className={`balance-hero-amount ${balance < 0 ? "negative" : ""}`}>
        {balance < 0 ? "-" : ""}${Math.abs(balance).toFixed(2)}
      </div>
      <div className="balance-stats">
        <div className="balance-stat">
          <span className="balance-stat-label">Income</span>
          <span className="balance-stat-value income-val">+${Number(income).toFixed(2)}</span>
        </div>
        <div className="balance-divider" />
        <div className="balance-stat">
          <span className="balance-stat-label">Expenses</span>
          <span className="balance-stat-value expense-val">-${Number(expenses).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
