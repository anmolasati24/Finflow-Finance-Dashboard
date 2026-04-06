import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { fmt, fmtShort, getSummary, getCategoryBreakdown } from "../utils/helpers";
import { CATEGORY_COLORS, MONTHLY_SUMMARY } from "../data/mockData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--card2)", border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem"
    }}>
      <div style={{ color: "var(--text3)", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmtShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { state } = useApp();
  const summary = useMemo(() => getSummary(state.transactions), [state.transactions]);
  const breakdown = useMemo(() => getCategoryBreakdown(state.transactions).slice(0, 6), [state.transactions]);
  const recent = state.transactions.slice(0, 5);
  const savingsRate = summary.income > 0 ? ((summary.balance / summary.income) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
          fontWeight: 800,
          letterSpacing: "-0.5px"
        }}>
          Financial Overview
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text3)", marginTop: 3 }}>
          Summary across all tracked transactions
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="summary-grid">
        <div className="summary-card balance">
          <div className="sc-header">
            <div className="sc-label">Net Balance</div>
            <div className="sc-icon">◈</div>
          </div>
          <div className={`sc-amount ${summary.balance >= 0 ? "blue" : "red"}`}>
            {fmtShort(Math.abs(summary.balance))}
          </div>
          <div className="sc-sub">
            Savings rate <span className="sc-badge">{savingsRate}%</span>
          </div>
        </div>

        <div className="summary-card income">
          <div className="sc-header">
            <div className="sc-label">Total Income</div>
            <div className="sc-icon" style={{ paddingBottom: 2 }}>↗</div>
          </div>
          <div className="sc-amount green">{fmtShort(summary.income)}</div>
          <div className="sc-sub">
            From <span className="sc-badge">{state.transactions.filter(t => t.type === "income").length} txns</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="sc-header">
            <div className="sc-label">Total Expenses</div>
            <div className="sc-icon" style={{ paddingTop: 2 }}>↘</div>
          </div>
          <div className="sc-amount red">{fmtShort(summary.expense)}</div>
          <div className="sc-sub">
            Across <span className="sc-badge">{state.transactions.filter(t => t.type === "expense").length} txns</span>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">

        {/* Balance Trend */}
        <div className="chart-card">
          <div className="chart-header-row">
            <div>
              <div className="chart-title">
                <span style={{ color: "var(--accent)" }}>~</span> Balance Trend
              </div>
              <div className="chart-sub">Monthly income vs expenses over time</div>
            </div>
            <div className="tag" style={{
              background: "var(--bg3)", color: "var(--text2)",
              border: "1px solid var(--border)", fontWeight: 500
            }}>6 Months</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_SUMMARY} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d982" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d982" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5c6e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff5c6e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#22d982" strokeWidth={2.5} fill="url(#incGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ff5c6e" strokeWidth={2.5} fill="url(#expGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Breakdown Pie */}
        <div className="chart-card">
          <div className="chart-header-row">
            <div>
              <div className="chart-title">
                <span style={{ color: "var(--purple)" }}>◑</span> Spending by Category
              </div>
              <div className="chart-sub">Top expense categories</div>
            </div>
          </div>

          {breakdown.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-text">No expense data</div>
            </div>
          ) : (
            <div className="pie-layout">
              <div className="pie-donut">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {breakdown.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[entry.category] || "#8b5cf6"}
                          stroke="var(--card)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [fmtShort(val), ""]}
                      contentStyle={{
                        background: "var(--card2)",
                        border: "1px solid var(--border2)",
                        borderRadius: 8,
                        fontSize: "0.78rem",
                        color: "var(--text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pie-legend-list">
                {breakdown.map((item) => {
                  const total = breakdown.reduce((s, i) => s + i.amount, 0);
                  const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
                  const color = CATEGORY_COLORS[item.category] || "#8b5cf6";
                  return (
                    <div key={item.category} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: color, flexShrink: 0
                      }} />
                      <span style={{
                        fontSize: "0.75rem", color: "var(--text2)", flex: 1,
                        minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {item.category}
                      </span>
                      <span style={{
                        fontSize: "0.72rem", color: "var(--text3)",
                        fontFamily: "DM Mono, monospace", flexShrink: 0
                      }}>
                        {pct}%
                      </span>
                      <span style={{
                        fontSize: "0.72rem", color: "var(--text2)",
                        fontFamily: "DM Mono, monospace", flexShrink: 0,
                        minWidth: 48, textAlign: "right"
                      }}>
                        {fmtShort(item.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Net Balance — spans full width */}
        <div className="chart-card dashboard-bar-card">
          <div className="chart-header-row">
            <div>
              <div className="chart-title">
                <span style={{ color: "var(--green)" }}>॥</span> Monthly Net Balance
              </div>
              <div className="chart-sub">Income minus expenses each month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_SUMMARY} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d982" stopOpacity={1} />
                  <stop offset="100%" stopColor="#22d982" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5c6e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ff5c6e" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.4 }} />
              <Bar dataKey="balance" name="Net Balance" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {MONTHLY_SUMMARY.map((entry, i) => (
                  <Cell key={i} fill={entry.balance >= 0 ? "url(#barGreen)" : "url(#barRed)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="chart-card recent-tx-card">
        <div className="section-header" style={{ marginBottom: "20px", padding: "0 4px" }}>
          <div>
            <div className="chart-title">
              <span style={{ color: "var(--yellow)" }}>☷</span> Recent Transactions
            </div>
            <div className="chart-sub">Latest 5 transactions summary</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ borderRadius: "20px", whiteSpace: "nowrap" }}>
            View All
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <div className="empty-text">No transactions found</div>
          </div>
        ) : (
          <div className="tx-list">
            <div className="tx-list-header">
              <div className="th-col th-desc">Transaction</div>
              <div className="th-col th-cat">Category</div>
              <div className="th-col th-type">Type</div>
              <div className="th-col th-amt">Amount</div>
            </div>

            {recent.map(t => {
              const catColor = CATEGORY_COLORS[t.category] || "#8b5cf6";
              return (
                <div key={t.id} className="tx-list-item">
                  <div className="td-col td-desc">
                    <div className="tx-icon-wrapper" style={{
                      background: `color-mix(in srgb, ${catColor} 15%, transparent)`,
                      color: catColor,
                      border: `1px solid color-mix(in srgb, ${catColor} 30%, transparent)`
                    }}>
                      {t.category.charAt(0)}
                    </div>
                    <div className="tx-info">
                      <div className="tx-name">{t.description}</div>
                      <div className="tx-date">{t.date}</div>
                    </div>
                  </div>

                  <div className="td-col td-cat">
                    <span className="cat-pill" style={{ color: catColor }}>
                      <span className="cat-dot" style={{ background: catColor }} />
                      {t.category}
                    </span>
                  </div>

                  <div className="td-col td-type">
                    <span className={`type-badge ${t.type}`}>{t.type}</span>
                  </div>

                  <div className="td-col td-amt">
                    <span className={`amount-cell ${t.type}`}>
                      {t.type === "income" ? "+" : "-"}{fmtShort(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}