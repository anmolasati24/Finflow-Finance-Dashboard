import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { fmt, fmtShort, getFilteredTransactions, exportCSV, exportJSON } from "../utils/helpers";
import { CATEGORIES, CATEGORY_COLORS } from "../data/mockData";
import TransactionModal from "./TransactionModal";

const PAGE_SIZE = 12;

const SortIcon = ({ active, asc }) => (
  <span className={`sort-icon ${active ? "active" : ""}`}>
    {!active ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 15l5 5 5-5M7 9l5-5 5-5" /></svg>
    ) : asc ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    ) : (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
    )}
  </span>
);

export default function Transactions() {
  const { state, dispatch } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [page, setPage] = useState(1);
  const isAdmin = state.role === "admin";

  const filtered = useMemo(
    () => getFilteredTransactions(state.transactions, state.filters, state.sort),
    [state.transactions, state.filters, state.sort]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    dispatch({
      type: "SET_SORT",
      payload: state.sort.field === field
        ? { field, dir: state.sort.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "desc" }
    });
    setPage(1);
  };

  const handleFilter = (key, val) => {
    dispatch({ type: "SET_FILTER", payload: { [key]: val } });
    setPage(1);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this transaction?")) {
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    }
  };

  const openAdd = () => { setEditTx(null); setModalOpen(true); };
  const openEdit = (tx) => { setEditTx(tx); setModalOpen(true); };

  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const hasActiveFilters = state.filters.search || state.filters.category !== "All" || state.filters.type !== "All" || state.filters.dateRange !== "all";

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">
            {filtered.length} results · <span style={{ color: "var(--green)" }}>↑ {fmtShort(totalIncome)}</span> · <span style={{ color: "var(--red)" }}>↓ {fmtShort(totalExpense)}</span>
          </div>
        </div>
        <div className="tx-header-actions">
          <button className="btn btn-ghost" onClick={() => exportCSV(filtered)}>⤓ CSV</button>
          <button className="btn btn-ghost" onClick={() => exportJSON(filtered)}>⤓ JSON</button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={state.filters.search}
            onChange={e => handleFilter("search", e.target.value)}
          />
        </div>
        <select className="filter-select" value={state.filters.category} onChange={e => handleFilter("category", e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={state.filters.type} onChange={e => handleFilter("type", e.target.value)}>
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="filter-select" value={state.filters.dateRange} onChange={e => handleFilter("dateRange", e.target.value)}>
          <option value="all">All Time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => {
            dispatch({ type: "SET_FILTER", payload: { search: "", category: "All", type: "All", dateRange: "all" } });
            setPage(1);
          }}>✕ Clear</button>
        )}
      </div>

      {/* Transaction List */}
      <div className="tx-table-wrap">
        {paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <div className="empty-text">No transactions match your filters</div>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet column header */}
            <div className="tx-cols-header">
              <div className="tx-col-date" onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                <div className="th-content">Date <SortIcon active={state.sort.field === "date"} asc={state.sort.dir === "asc"} /></div>
              </div>
              <div className="tx-col-desc">
                <div className="th-content">Description</div>
              </div>
              <div className="tx-col-cat" onClick={() => handleSort("category")} style={{ cursor: "pointer" }}>
                <div className="th-content">Category <SortIcon active={state.sort.field === "category"} asc={state.sort.dir === "asc"} /></div>
              </div>
              <div className="tx-col-type" onClick={() => handleSort("type")} style={{ cursor: "pointer" }}>
                <div className="th-content">Type <SortIcon active={state.sort.field === "type"} asc={state.sort.dir === "asc"} /></div>
              </div>
              <div className="tx-col-amt" onClick={() => handleSort("amount")} style={{ cursor: "pointer" }}>
                <div className="th-content">Amount <SortIcon active={state.sort.field === "amount"} asc={state.sort.dir === "asc"} /></div>
              </div>
              {isAdmin && <div className="tx-col-act">Actions</div>}
            </div>

            {/* Rows */}
            <div className="tx-rows">
              {paginated.map(t => {
                const catColor = CATEGORY_COLORS[t.category] || "#8b5cf6";
                return (
                  <div key={t.id} className="tx-row">
                    {/* Icon + name (always visible) */}
                    <div className="tx-row-main">
                      <div className="tx-icon-wrapper" style={{
                        background: `color-mix(in srgb, ${catColor} 15%, transparent)`,
                        color: catColor,
                        border: `1px solid color-mix(in srgb, ${catColor} 30%, transparent)`,
                      }}>
                        {t.category.charAt(0)}
                      </div>
                      <div className="tx-row-info">
                        <span className="tx-name">{t.description}</span>
                        {/* Mobile-only: show date + category inline */}
                        <span className="tx-row-meta">
                          <span className="tx-date">{t.date}</span>
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text3)", display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: "0.72rem", color: catColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category}</span>
                          <span style={{ marginLeft: 2, flexShrink: 0 }}><span className={`type-badge ${t.type}`} style={{ fontSize: "0.62rem", padding: "2px 6px" }}>{t.type}</span></span>
                        </span>
                      </div>
                    </div>

                    {/* Desktop-only columns */}
                    <div className="tx-col-date tx-cell-date mono">{t.date}</div>
                    <div className="tx-col-cat tx-cell-cat">
                      <span className="cat-pill" style={{ color: catColor }}>
                        <span className="cat-dot" style={{ background: catColor }} />
                        {t.category}
                      </span>
                    </div>
                    <div className="tx-col-type tx-cell-type">
                      <span className={`type-badge ${t.type}`}>{t.type}</span>
                    </div>

                    {/* Amount (always visible, right-aligned) */}
                    <div className="tx-col-amt tx-cell-amt">
                      <span className={`amount-cell ${t.type}`} style={{ color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                        {t.type === "income" ? "+" : "-"}{fmtShort(t.amount)}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="tx-col-act tx-cell-act">
                        <button className="btn btn-edit btn-sm" onClick={() => openEdit(t)}>✎</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="pagination-btns">
                <button className="pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = startPage + i;
                  return (
                    <button key={p} className={`pg-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                  );
                })}
                <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <TransactionModal
          tx={editTx}
          onClose={() => { setModalOpen(false); setEditTx(null); }}
        />
      )}
    </div>
  );
}
