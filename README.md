# Finflow – Finance Dashboard

A premium, interactive personal finance dashboard built with React and Recharts. Designed with a meticulous focus on modern UI/UX principles, performance, and clear data visualization.

---

## 7. Documentation & Setup Instructions

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# The app will be running at http://localhost:5173
```

**Requirements:** Node.js 18+

### Overview of Approach
Finflow acts as a completely client-side application simulating a full-stack experience through powerful state management and mock data ingestion. All functionality—from charting to role-based access control—runs directly in the browser with instant feedback, persisting user actions purely through browser Local Storage.

---

## Assessment Criteria & Features

### 1. Design and Creativity
- **Aesthetics**: Features a bespoke, dark-mode native design using geometric sans-serif typography (`Plus Jakarta Sans` for headers, `Inter` for body copy, and `JetBrains Mono` for tabulated numbers) inspired by modern SaaS and fintech platforms.
- **Data Visualization**: Employs heavily customized `recharts` graphs prioritizing readability, including an area trend chart with color gradients, a grouped monthly bar chart, and a categorical pie chart with distinct, accessible color palettes.

### 2. Responsiveness
- **Layout Adaptability**: Constructed using custom CSS Grid and Flexbox layouts. 
- **Device Support**: Fully fluid UI that shifts from a multi-column desktop interface into a streamlined, single-column scrollable feed for mobile users seamlessly, ensuring charts resize dynamically.

### 3. Functionality
- **Dashboard Overview**: Comprehensive top-level summary displaying Net Balance, Total Income, Total Expenses, and Savings Rate.
- **Role-Based Access Control (RBAC)**: Switch between **Viewer** (read-only) and **Admin** (can add/edit/delete transactions) roles instantly from the navigation bar. True UI adaptation based on role presence.
- **Exporting**: Instant data-dump capabilities allowing the user to export currently filtered transactional tables into exactly formatted CSV or JSON files.

### 4. User Experience
- **Navigation Clarity**: A straightforward three-page structure (`Dashboard`, `Transactions`, `Insights`).
- **Interaction Design**: Includes premium micro-interactions, such as hover highlighting on completely custom SVG sorting icons within table headers, modal fade-ins, and soft CSS transitions on every single interactive element.
- **Advanced Filtering**: Combine live text-search, date-ranges, category dropdowns, and income/expense toggles with no latency.

### 5. Technical Quality
- **Code Structure**: React components are modular and logically separated (e.g., `Dashboard.jsx`, `Transactions.jsx`, `TransactionModal.jsx`). Helper utilities and mock data are completely decoupled to maintain strict separation of concerns.
- **Dependencies**: Operates extremely lean with no bloated component UI libraries (only React, Vite, and Recharts), leaning instead on completely custom `.css` handling to prove technical proficiency and ensure lightning-fast load times.

### 6. State Management Approach
- **Global Architecture**: Eschews heavier setups like Redux in favor of React's native `useReducer` and the `Context API` wrapped into a clean `useApp()` custom hook. 
- **Data Persistence**: State hooks into a `useEffect` system that continuously hydrates and syncs the entire application state (The theme, current role status, and full transaction data) directly into `localStorage`. State updates perform complex operations (filtering, sorting array states) safely by returning immutable clones.

### 8. Attention to Detail
- **Empty States**: Every dynamic section—from the recent transaction list to chart blocks—degrades gracefully with stylish "Empty State" blockers if a filter yields zero results.
- **UI Polish**: Adherence to precise pixel spacing, subtle `backdrop-filter` usage on sticky navbars, complex color manipulation for active vs inactive states, and data analytics (The "Insights" tab writes out grammatically correct financial evaluations dynamically based on math from the data).

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Routing | Custom simple-page state (`useState`) |
| Build Tool | Vite 5 |
| Charts | Recharts |
| Framework | React 18 |
| Styling | Vanilla CSS Variables |
| Fonts | Plus Jakarta Sans, Inter, JetBrains Mono |
