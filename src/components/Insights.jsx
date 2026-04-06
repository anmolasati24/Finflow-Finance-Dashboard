import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { fmtShort, fmt, getSummary, getCategoryBreakdown } from "../utils/helpers";
import { CATEGORY_COLORS, MONTHLY_SUMMARY } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

/* ─── Recharts tooltip (used by other charts) ─────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--card2)", border: "1px solid var(--border2)",
      borderRadius: 10, padding: "10px 14px", fontSize: "0.8rem",
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
    }}>
      <div style={{ color: "var(--text3)", marginBottom: 6, fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--text2)" }}>{p.name}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "var(--text)" }}>{fmtShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Creative custom SVG bar chart ───────────────────────────── */
const DaySpendingChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  const W = 700, H = 220;
  const PAD = { top: 32, right: 20, bottom: 44, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map(d => d.amount), 1);
  const barW = Math.floor(chartW / data.length);
  const BAR_GAP = Math.max(8, barW * 0.28);
  const actualBarW = barW - BAR_GAP;

  // Y gridlines
  const TICKS = 4;
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => (maxVal / TICKS) * i);

  const peakIdx = data.reduce((pi, d, i) => d.amount > data[pi].amount ? i : pi, 0);

  // Bar color logic
  const barColor = (i, amount) => {
    if (amount === 0) return { fill: "var(--border)", glow: false };
    if (i === peakIdx) return { fill: "#4f8ef7", glow: true };
    const intensity = 0.35 + (amount / maxVal) * 0.45;
    return { fill: `rgba(100,140,220,${intensity})`, glow: false };
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: "visible", display: "block" }}
        aria-label="Spending by day of week"
      >
        <defs>
          {/* Peak bar gradient */}
          <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6fa4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#3a6fd8" stopOpacity="0.7" />
          </linearGradient>

          {/* Normal bar gradient */}
          <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a5f8a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2a3554" stopOpacity="0.5" />
          </linearGradient>

          {/* Hover bar gradient */}
          <linearGradient id="hoverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8ab4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#5580e0" stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter for peak */}
          <filter id="barGlow" x="-30%" y="-10%" width="160%" height="130%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle glow for hover */}
          <filter id="hoverGlow" x="-30%" y="-10%" width="160%" height="130%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip for rounded top bars */}
          {data.map((_, i) => {
            const x = PAD.left + i * barW + BAR_GAP / 2;
            const barH = (data[i].amount / maxVal) * chartH;
            const y = PAD.top + chartH - barH;
            return (
              <clipPath key={i} id={`clip-${i}`}>
                <rect x={x} y={y} width={actualBarW} height={barH + 4} rx="5" ry="5" />
              </clipPath>
            );
          })}
        </defs>

        {/* ── Horizontal grid lines ── */}
        {yTicks.map((tick, i) => {
          const y = PAD.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD.left} y1={y}
                x2={PAD.left + chartW} y2={y}
                stroke="var(--border)"
                strokeWidth={i === 0 ? 1.5 : 0.75}
                strokeOpacity={i === 0 ? 0.8 : 0.4}
                strokeDasharray={i === 0 ? "none" : "4 5"}
              />
              <text
                x={PAD.left - 8} y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--text3)"
                fontFamily="'JetBrains Mono', monospace"
              >
                {fmtShort(tick)}
              </text>
            </g>
          );
        })}

        {/* ── Bars ── */}
        {data.map((d, i) => {
          const x = PAD.left + i * barW + BAR_GAP / 2;
          const barH = Math.max((d.amount / maxVal) * chartH, d.amount > 0 ? 4 : 0);
          const y = PAD.top + chartH - barH;
          const isPeak = i === peakIdx;
          const isHov = hovered === i;
          const isEmpty = d.amount === 0;

          const fillId = isPeak
            ? "url(#peakGrad)"
            : isHov
            ? "url(#hoverGrad)"
            : "url(#normalGrad)";

          return (
            <g
              key={d.day}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Hover background highlight */}
              {isHov && (
                <rect
                  x={x - 4}
                  y={PAD.top}
                  width={actualBarW + 8}
                  height={chartH}
                  rx={6}
                  fill="rgba(79,142,247,0.06)"
                />
              )}

              {/* Bar shadow / base plate */}
              {!isEmpty && (
                <rect
                  x={x + 2}
                  y={PAD.top + chartH - barH + 2}
                  width={actualBarW}
                  height={barH}
                  rx={5}
                  fill="rgba(0,0,0,0.25)"
                />
              )}

              {/* Main bar */}
              {!isEmpty && (
                <rect
                  x={x}
                  y={y}
                  width={actualBarW}
                  height={barH}
                  rx={5}
                  fill={fillId}
                  filter={isPeak ? "url(#barGlow)" : isHov ? "url(#hoverGlow)" : undefined}
                  style={{
                    transition: "filter 0.2s, opacity 0.2s",
                    opacity: !isHov && !isPeak && hovered !== null ? 0.5 : 1
                  }}
                />
              )}

              {/* Shine strip on top of bar */}
              {!isEmpty && (
                <rect
                  x={x + 3}
                  y={y + 2}
                  width={actualBarW - 6}
                  height={Math.min(barH * 0.35, 18)}
                  rx={3}
                  fill="rgba(255,255,255,0.08)"
                />
              )}

              {/* Peak crown indicator */}
              {isPeak && (
                <g>
                  <circle cx={x + actualBarW / 2} cy={y - 10} r={4} fill="#4f8ef7" opacity={0.9} />
                  <circle cx={x + actualBarW / 2} cy={y - 10} r={7} fill="none" stroke="#4f8ef7" strokeWidth={1} opacity={0.4} />
                </g>
              )}

              {/* Value label (show on hover or peak) */}
              {(isHov || isPeak) && d.amount > 0 && (
                <g>
                  <rect
                    x={x + actualBarW / 2 - 22}
                    y={y - 28}
                    width={44}
                    height={18}
                    rx={4}
                    fill={isPeak ? "rgba(79,142,247,0.9)" : "rgba(30,40,64,0.92)"}
                    stroke={isPeak ? "rgba(111,164,255,0.5)" : "var(--border2)"}
                    strokeWidth={1}
                  />
                  <text
                    x={x + actualBarW / 2}
                    y={y - 15}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="600"
                    fill="#fff"
                  >
                    {fmtShort(d.amount)}
                  </text>
                </g>
              )}

              {/* Day label */}
              <text
                x={x + actualBarW / 2}
                y={PAD.top + chartH + 20}
                textAnchor="middle"
                fontSize={isPeak ? 11.5 : 10.5}
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight={isPeak ? 700 : 500}
                fill={isPeak ? "#6fa4ff" : isHov ? "var(--text2)" : "var(--text3)"}
                style={{ transition: "fill 0.15s" }}
              >
                {d.day}
              </text>

              {/* Peak label under day */}
              {isPeak && (
                <text
                  x={x + actualBarW / 2}
                  y={PAD.top + chartH + 34}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight={700}
                  fill="#4f8ef7"
                  letterSpacing="0.8"
                >
                  PEAK
                </text>
              )}
            </g>
          );
        })}

        {/* ── Vertical axis label ── */}
        <text
          x={14}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontSize={9}
          fill="var(--text3)"
          fontFamily="'JetBrains Mono', monospace"
          transform={`rotate(-90, 14, ${PAD.top + chartH / 2})`}
          letterSpacing="1"
        >
          AMOUNT
        </text>
      </svg>

      {/* ── Legend strip ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        marginTop: 4, paddingLeft: 56,
        fontSize: "0.72rem", color: "var(--text3)",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 2,
            background: "linear-gradient(180deg,#6fa4ff,#3a6fd8)",
            display: "inline-block"
          }} />
          Peak day
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 2,
            background: "linear-gradient(180deg,#4a5f8a,#2a3554)",
            display: "inline-block"
          }} />
          Other days
        </div>
        <div style={{ marginLeft: "auto", color: "var(--text3)" }}>
          Hover a bar for details
        </div>
      </div>
    </div>
  );
};

/* ─── KPI card ────────────────────────────────────────────────── */
const KpiCard = ({ label, value, detail, color, icon, trend, trendLabel, trendUp }) => (
  <div className="insight-card kpi-card">
    <div className="kpi-top">
      <div className="kpi-icon" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`tag ${trendUp ? "tag-up" : "tag-down"}`} style={{ fontSize: "0.7rem" }}>
          {trendUp ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="insight-label" style={{ marginTop: 14 }}>{label}</div>
    <div className="insight-value" style={{ color }}>{value}</div>
    <div className="insight-detail">{detail}</div>
    {trendLabel && (
      <div style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text3)", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
        {trendLabel}
      </div>
    )}
  </div>
);

/* ─── Main page ───────────────────────────────────────────────── */
export default function Insights() {
  const { state } = useApp();

  const summary = useMemo(() => getSummary(state.transactions), [state.transactions]);
  const breakdown = useMemo(() => getCategoryBreakdown(state.transactions), [state.transactions]);
  const topCategory = breakdown[0];

  const lastTwo = MONTHLY_SUMMARY.slice(-2);
  const prevMonth = lastTwo[0];
  const currMonth = lastTwo[1];
  const expenseDiff = currMonth && prevMonth
    ? ((currMonth.expense - prevMonth.expense) / prevMonth.expense * 100).toFixed(1) : 0;
  const incomeDiff = currMonth && prevMonth
    ? ((currMonth.income - prevMonth.income) / prevMonth.income * 100).toFixed(1) : 0;

  const expenses = state.transactions.filter(t => t.type === "expense");
  const avgExpense = expenses.length ? Math.round(expenses.reduce((s, t) => s + t.amount, 0) / expenses.length) : 0;
  const savingsRate = summary.income > 0 ? (summary.balance / summary.income * 100).toFixed(1) : 0;
  const sortedMonths = [...MONTHLY_SUMMARY].sort((a, b) => b.expense - a.expense);

  const dayDist = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    expenses.forEach(t => counts[new Date(t.date).getDay()] += t.amount);
    return days.map((d, i) => ({ day: d, amount: counts[i] }));
  }, [expenses]);

  const totalBreakdown = breakdown.reduce((s, i) => s + i.amount, 0);

  const observations = [
    topCategory && {
      icon: "📊", color: "var(--orange)",
      bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",
      title: "Top Spending Category",
      text: `${topCategory.category} leads your expenses at ${fmt(topCategory.amount)}. Consider reviewing this category for potential savings.`
    },
    {
      icon: Number(savingsRate) >= 20 ? "✅" : "⚠️",
      color: Number(savingsRate) >= 20 ? "var(--green)" : "var(--yellow)",
      bg: Number(savingsRate) >= 20 ? "rgba(34,217,130,0.08)" : "rgba(251,191,36,0.08)",
      border: Number(savingsRate) >= 20 ? "rgba(34,217,130,0.2)" : "rgba(251,191,36,0.2)",
      title: "Savings Health",
      text: Number(savingsRate) >= 20
        ? `You're saving ${savingsRate}% of your income — excellent! Financial advisors recommend at least 20%.`
        : `Your savings rate is ${savingsRate}%. Aim for 20%+ by reducing discretionary spending.`
    },
    Number(expenseDiff) > 15 && {
      icon: "⚡", color: "var(--red)",
      bg: "rgba(255,92,110,0.08)", border: "rgba(255,92,110,0.2)",
      title: "Expense Spike Detected",
      text: `Expenses jumped ${expenseDiff}% this month vs last month. Review your recent transactions to identify any unexpected spikes.`
    },
    {
      icon: "💡", color: "var(--accent)",
      bg: "rgba(79,142,247,0.08)", border: "rgba(79,142,247,0.2)",
      title: "Transaction Activity",
      text: `Your average expense is ${fmt(avgExpense)} across ${expenses.length} transactions. Tracking consistently helps spot trends early.`
    }
  ].filter(Boolean);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(1.2rem,4vw,1.6rem)", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Insights
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text3)", marginTop: 3 }}>
          Patterns and observations from your financial data
        </p>
      </div>

      {/* KPI Row */}
      <div className="insights-grid">
        <KpiCard label="Top Category" value={topCategory?.category || "—"} detail={topCategory ? `${fmtShort(topCategory.amount)} total spent` : "No data"} color={topCategory ? CATEGORY_COLORS[topCategory.category] : "var(--text)"} icon="🏷️" />
        <KpiCard label="Savings Rate" value={`${savingsRate}%`} detail={`${fmtShort(summary.balance)} saved overall`} color={Number(savingsRate) >= 20 ? "var(--green)" : Number(savingsRate) >= 0 ? "var(--yellow)" : "var(--red)"} icon="🎯" trendLabel={Number(savingsRate) >= 20 ? "✓ Healthy savings target met" : "⚠ Below recommended 20%"} />
        <KpiCard label="Avg. Expense" value={fmtShort(avgExpense)} detail={`across ${expenses.length} transactions`} color="var(--accent)" icon="📉" />
        <KpiCard label="This Month Expenses" value={currMonth ? fmtShort(currMonth.expense) : "—"} detail="current month spend" color={Number(expenseDiff) > 0 ? "var(--red)" : "var(--green)"} icon="💸" trend={expenseDiff} trendUp={Number(expenseDiff) > 0} trendLabel="vs previous month" />
        <KpiCard label="This Month Income" value={currMonth ? fmtShort(currMonth.income) : "—"} detail="current month earnings" color="var(--green)" icon="💰" trend={incomeDiff} trendUp={Number(incomeDiff) >= 0} trendLabel="vs previous month" />
        <KpiCard label="Highest Spend Month" value={sortedMonths[0]?.month || "—"} detail={sortedMonths[0] ? `${fmtShort(sortedMonths[0].expense)} in expenses` : "No data"} color="var(--purple)" icon="📅" />
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ marginTop: 4 }}>
        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-header-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="chart-title"><span style={{ color: "var(--orange)" }}>◧</span> Category Breakdown</div>
              <div className="chart-sub">Total expenses per category</div>
            </div>
          </div>
          {breakdown.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">◎</div><div className="empty-text">No data</div></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
              {breakdown.map((item) => {
                const pct = totalBreakdown > 0 ? (item.amount / totalBreakdown * 100) : 0;
                const color = CATEGORY_COLORS[item.category] || "var(--accent)";
                return (
                  <div key={item.category} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      color, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", fontWeight: 700, flexShrink: 0
                    }}>
                      {item.category.charAt(0)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text2)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.category}
                        </span>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0, fontSize: "0.72rem" }}>
                          <span style={{ color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>{pct.toFixed(1)}%</span>
                          <span style={{ color: "var(--text2)", fontFamily: "'JetBrains Mono', monospace" }}>{fmtShort(item.amount)}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: "var(--bg3)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 4, background: color,
                          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                          boxShadow: `0 0 8px color-mix(in srgb, ${color} 60%, transparent)`
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Comparison Bar */}
        <div className="chart-card">
          <div className="chart-header-row" style={{ marginBottom: 16 }}>
            <div>
              <div className="chart-title"><span style={{ color: "var(--green)" }}>॥</span> Monthly Comparison</div>
              <div className="chart-sub">Income vs expenses month by month</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={MONTHLY_SUMMARY} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickMargin={8} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} tickMargin={8} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
              <Bar dataKey="income" name="Income" fill="var(--green)" radius={[4, 4, 0, 0]} opacity={0.85} maxBarSize={20} />
              <Bar dataKey="expense" name="Expense" fill="var(--red)" radius={[4, 4, 0, 0]} opacity={0.85} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Spending by Day of Week — custom SVG ── */}
        <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <div className="chart-header-row" style={{ marginBottom: 8 }}>
            <div>
              <div className="chart-title">
                <span style={{ color: "var(--accent)" }}>⋯</span> Spending by Day of Week
              </div>
              <div className="chart-sub">Total expense amount per weekday — highlights your peak spending day</div>
            </div>
            {/* Peak day badge */}
            {dayDist.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)",
                borderRadius: 8, padding: "6px 12px"
              }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>Peak</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6fa4ff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {dayDist.reduce((p, d) => d.amount > p.amount ? d : p, dayDist[0]).day}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text2)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtShort(Math.max(...dayDist.map(d => d.amount)))}
                </span>
              </div>
            )}
          </div>

          <DaySpendingChart data={dayDist} />
        </div>
      </div>

      {/* Key Observations */}
      <div className="chart-card" style={{ marginTop: 4 }}>
        <div className="chart-header-row" style={{ marginBottom: 16 }}>
          <div>
            <div className="chart-title"><span style={{ color: "var(--yellow)" }}>✦</span> Key Observations</div>
            <div className="chart-sub">AI-style analysis based on your financial data</div>
          </div>
          <span className="tag" style={{ background: "rgba(79,142,247,0.1)", color: "var(--accent)", border: "1px solid rgba(79,142,247,0.2)" }}>
            {observations.length} insights
          </span>
        </div>
        <div className="obs-grid">
          {observations.map((obs, i) => (
            <div key={i} className="obs-card" style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "16px 18px", background: obs.bg,
              borderRadius: "var(--radius-sm)", border: `1px solid ${obs.border}`,
              transition: "all 0.2s ease"
            }}>
              <span style={{ fontSize: "1.3rem", flexShrink: 0, lineHeight: 1 }}>{obs.icon}</span>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: obs.color, marginBottom: 4, letterSpacing: "0.2px" }}>
                  {obs.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.6 }}>
                  {obs.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}