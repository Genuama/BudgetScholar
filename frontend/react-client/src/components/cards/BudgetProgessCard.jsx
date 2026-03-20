export default function BudgetProgressCard({ budget }) {
  const { budget_name, category, budget_amount, spent, period } = budget;
  const remaining = budget_amount - spent;
  const pct = Math.min((spent / budget_amount) * 100, 100);
  const over = spent > budget_amount;
  const warning = !over && pct >= 75;

  let fillClass = "";
  if (over) fillClass = "over";
  else if (warning) fillClass = "warning";

  let statusLabel = over
    ? `$${Math.abs(remaining).toFixed(2)} over`
    : warning
    ? `$${remaining.toFixed(2)} left`
    : `$${remaining.toFixed(2)} left`;

  let statusClass = over ? "over" : warning ? "warn" : "ok";

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
    </div>
  );
}
