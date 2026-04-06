# 💸 Finflow — Finance Dashboard

A personal finance dashboard built with **React + Vite**, featuring interactive charts, transaction management, category breakdowns, and smart spending insights.

---

## ✨ Features

- **Dashboard** — Net balance, income & expense summary cards with savings rate
- **Balance Trend** — Area chart showing monthly income vs expenses over 6 months
- **Spending by Category** — Donut chart with percentage breakdown
- **Monthly Net Balance** — Bar chart with green/red gradient bars
- **Recent Transactions** — Latest 5 transactions with category, type, and amount
- **Transactions Page** — Full transaction list with search, filter, sort, and pagination
- **Insights Page** — KPI cards, category breakdown bars, monthly comparison, day-of-week spending chart, and key observations
- **Dark / Light theme** toggle
- **Role-based view** (Admin / Viewer)
- **Fully responsive** — works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Recharts | Chart library |
| Context API | Global state management |
| CSS Variables | Theming (dark/light) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx       # Overview page
│   ├── Transactions.jsx    # Transaction list & management
│   ├── Insights.jsx        # Analytics & charts
│   ├── Navbar.jsx          # Navigation & theme toggle
│   └── TransactionModal.jsx # Add/edit transaction modal
├── context/
│   └── AppContext.jsx      # Global state (transactions, theme, role)
├── data/
│   └── mockData.js         # Sample transactions & monthly summaries
├── utils/
│   └── helpers.js          # Formatting & aggregation utilities
├── App.jsx
├── App.css
└── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Finflow-Finance-Dashboard.git

# Navigate into the project
cd Finflow-Finance-Dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---


## 📌 Roadmap

- [ ] Backend integration (real transaction data)
- [ ] Export transactions to CSV
- [ ] Budget goals & alerts
- [ ] Multi-currency support
- [ ] Authentication

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ using React & Vite
