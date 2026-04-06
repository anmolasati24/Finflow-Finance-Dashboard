import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

export default function TransactionModal({ tx, onClose }) {
  const { dispatch } = useApp();
  const isEdit = !!tx;

  const [form, setForm] = useState({
    date: tx?.date || new Date().toISOString().split("T")[0],
    description: tx?.description || "",
    category: tx?.category || CATEGORIES[0],
    type: tx?.type || "expense",
    amount: tx?.amount || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (!form.date) e.date = "Date is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = {
      ...(tx || {}),
      id: tx?.id || Date.now(),
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      type: form.type,
      amount: Number(form.amount),
    };
    dispatch({ type: isEdit ? "EDIT_TRANSACTION" : "ADD_TRANSACTION", payload });
    onClose();
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? "Edit Transaction" : "Add Transaction"}</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            {errors.date && <div style={{ color: "var(--red)", fontSize: "0.72rem", marginTop: 3 }}>{errors.date}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => {
              const v = e.target.value;
              set("type", v);
              if (v === "income") set("category", "Salary");
              else set("category", CATEGORIES[0]);
            }}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Grocery shopping"
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
          {errors.description && <div style={{ color: "var(--red)", fontSize: "0.72rem", marginTop: 3 }}>{errors.description}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="0"
              value={form.amount}
              onChange={e => set("amount", e.target.value)}
            />
            {errors.amount && <div style={{ color: "var(--red)", fontSize: "0.72rem", marginTop: 3 }}>{errors.amount}</div>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
