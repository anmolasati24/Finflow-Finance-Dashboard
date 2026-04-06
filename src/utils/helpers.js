export const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const fmtShort = (n) => {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};

export const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const getFilteredTransactions = (transactions, filters, sort) => {
  let result = [...transactions];
  const q = filters.search.toLowerCase();
  if (q) result = result.filter(t =>
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    String(t.amount).includes(q)
  );
  if (filters.category !== "All") result = result.filter(t => t.category === filters.category);
  if (filters.type !== "All") result = result.filter(t => t.type === filters.type);
  if (filters.dateRange !== "all") {
    const now = new Date();
    const cutoff = new Date();
    if (filters.dateRange === "7d") cutoff.setDate(now.getDate() - 7);
    else if (filters.dateRange === "30d") cutoff.setDate(now.getDate() - 30);
    else if (filters.dateRange === "90d") cutoff.setDate(now.getDate() - 90);
    result = result.filter(t => new Date(t.date) >= cutoff);
  }
  result.sort((a, b) => {
    let av = a[sort.field], bv = b[sort.field];
    if (sort.field === "date") { av = new Date(av); bv = new Date(bv); }
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
  return result;
};

export const getSummary = (transactions) => {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
};

export const getCategoryBreakdown = (transactions) => {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));
};

export const exportCSV = (transactions) => {
  const header = "Date,Description,Category,Type,Amount\n";
  const rows = transactions.map(t =>
    `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
};

export const exportJSON = (transactions) => {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "transactions.json"; a.click();
};
