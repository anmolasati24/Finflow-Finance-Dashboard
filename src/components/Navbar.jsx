import { useApp } from "../context/AppContext";

export default function Navbar({ page, setPage }) {
  const { state, dispatch } = useApp();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ◈ <span className="brand-name">Finflow</span>
      </div>
      <div className="nav-tabs">
        {[
          { id: "dashboard", label: "Dashboard", icon: "⬡" },
          { id: "transactions", label: "Transactions", icon: "⇌" },
          { id: "insights", label: "Insights", icon: "◎" },
        ].map(t => (
          <button
            key={t.id}
            className={`nav-tab${page === t.id ? " active" : ""}`}
            onClick={() => setPage(t.id)}
          >
            <span>{t.icon}</span> <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="navbar-right">
        <span className={`role-badge ${state.role}`}>{state.role}</span>
        <select
          className="role-select"
          value={state.role}
          onChange={e => dispatch({ type: "SET_ROLE", payload: e.target.value })}
          title="Switch Role"
        >
          <option value="viewer">👁 Viewer</option>
          <option value="admin">🔑 Admin</option>
        </select>
        <button
          className="theme-btn"
          onClick={() => dispatch({ type: "TOGGLE_THEME" })}
          title="Toggle theme"
        >
          {state.theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </nav>
  );
}
