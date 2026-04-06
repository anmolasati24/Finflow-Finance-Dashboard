export const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Healthcare", "Utilities", "Housing", "Salary", "Freelance", "Investment"
];

export const CATEGORY_COLORS = {
  "Food & Dining": "#f97316",
  "Transport": "#3b82f6",
  "Shopping": "#ec4899",
  "Entertainment": "#a855f7",
  "Healthcare": "#10b981",
  "Utilities": "#f59e0b",
  "Housing": "#6366f1",
  "Salary": "#22c55e",
  "Freelance": "#14b8a6",
  "Investment": "#8b5cf6",
};

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const descriptions = {
  "Food & Dining": ["Zomato Order", "Swiggy Delivery", "Cafe Coffee Day", "McDonald's", "Restaurant Bill", "Grocery Store"],
  "Transport": ["Uber Ride", "Ola Cab", "Metro Card Recharge", "Fuel Fill", "Auto Rickshaw"],
  "Shopping": ["Amazon Purchase", "Flipkart Order", "Myntra Clothes", "Reliance Digital", "Big Bazaar"],
  "Entertainment": ["Netflix Subscription", "Spotify Premium", "Movie Tickets", "BookMyShow", "Gaming"],
  "Healthcare": ["Apollo Pharmacy", "Doctor Consultation", "Lab Tests", "Health Insurance"],
  "Utilities": ["Electricity Bill", "Water Bill", "Internet Bill", "Mobile Recharge"],
  "Housing": ["Rent Payment", "Society Maintenance", "House Cleaning"],
  "Salary": ["Monthly Salary", "Performance Bonus"],
  "Freelance": ["Client Payment", "Consulting Fee", "Project Milestone"],
  "Investment": ["SIP Investment", "Stock Purchase", "Fixed Deposit"],
};

let idCounter = 1;
const generateTransaction = (date, overrides = {}) => {
  const isIncome = overrides.type === "income" || Math.random() < 0.25;
  const category = isIncome
    ? (overrides.category || ["Salary", "Freelance", "Investment"][rnd(0, 2)])
    : (overrides.category || CATEGORIES.slice(0, 7)[rnd(0, 6)]);
  const descs = descriptions[category];
  return {
    id: idCounter++,
    date: date.toISOString().split("T")[0],
    description: descs[rnd(0, descs.length - 1)],
    category,
    amount: isIncome ? rnd(8000, 85000) : rnd(200, 8000),
    type: isIncome ? "income" : "expense",
    ...overrides,
  };
};

// Generate 6 months of data
const generateMonthlyData = () => {
  const transactions = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // 1-2 income transactions per month
    transactions.push(generateTransaction(new Date(month.getFullYear(), month.getMonth(), 1), { type: "income", category: "Salary" }));
    if (Math.random() > 0.4) {
      transactions.push(generateTransaction(new Date(month.getFullYear(), month.getMonth(), rnd(10, 20)), { type: "income" }));
    }
    // 15-25 expense transactions per month
    const expCount = rnd(15, 25);
    for (let i = 0; i < expCount; i++) {
      const day = rnd(1, 28);
      transactions.push(generateTransaction(new Date(month.getFullYear(), month.getMonth(), day)));
    }
  }
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const INITIAL_TRANSACTIONS = generateMonthlyData();

export const MONTHLY_SUMMARY = (() => {
  const months = {};
  INITIAL_TRANSACTIONS.forEach(t => {
    const key = t.date.slice(0, 7);
    if (!months[key]) months[key] = { income: 0, expense: 0 };
    months[key][t.type] += t.amount;
  });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
})();
