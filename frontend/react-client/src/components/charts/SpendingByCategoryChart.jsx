import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const SERIES_BLUE = "#2563EB";
const MUTED_INK = "#898781";
const SECONDARY_INK = "#52514E";
const AXIS_LINE = "#c3c2b7";

const MAX_CATEGORIES = 8;

function aggregateSpendingByCategory(transactions) {
  const totals = new Map();
  for (const t of transactions) {
    if (t.type !== "expenses") continue;
    const key = t.category || "Uncategorized";
    totals.set(key, (totals.get(key) || 0) + Number(t.amount));
  }

  const sorted = [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  if (sorted.length <= MAX_CATEGORIES) return sorted;

  const top = sorted.slice(0, MAX_CATEGORIES - 1);
  const otherTotal = sorted.slice(MAX_CATEGORIES - 1).reduce((sum, c) => sum + c.amount, 0);
  return [...top, { name: "Other", amount: otherTotal }];
}

function formatDollars(value) {
  return `$${Number(value).toFixed(0)}`;
}

export default function SpendingByCategoryChart({ transactions }) {
  const data = aggregateSpendingByCategory(transactions);

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <h3 className="section-title">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
          <XAxis
            type="number"
            tickFormatter={formatDollars}
            tick={{ fill: MUTED_INK, fontSize: 12 }}
            axisLine={{ stroke: AXIS_LINE }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: "#1a1a2e", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
            formatter={value => [`$${Number(value).toFixed(2)}`, "Spent"]}
          />
          <Bar dataKey="amount" fill={SERIES_BLUE} radius={[0, 4, 4, 0]} maxBarSize={24}>
            <LabelList dataKey="amount" position="right" formatter={formatDollars} fill={SECONDARY_INK} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
