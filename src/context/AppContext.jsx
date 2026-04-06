import { createContext, useContext, useReducer, useEffect } from "react";
import { INITIAL_TRANSACTIONS } from "../data/mockData";

const AppContext = createContext();

const STORAGE_KEY = "finance_dashboard_state";

const initialState = {
  transactions: INITIAL_TRANSACTIONS,
  role: "viewer", // "viewer" | "admin"
  theme: "dark",
  filters: { search: "", category: "All", type: "All", dateRange: "all" },
  sort: { field: "date", dir: "desc" },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ROLE": return { ...state, role: action.payload };
    case "TOGGLE_THEME": return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "SET_FILTER": return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_SORT": return { ...state, sort: action.payload };
    case "ADD_TRANSACTION": return { ...state, transactions: [action.payload, ...state.transactions] };
    case "EDIT_TRANSACTION":
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case "HYDRATE": return { ...state, ...action.payload };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, role: parsed.role, theme: parsed.theme, transactions: parsed.transactions };
      }
    } catch {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: state.role, theme: state.theme, transactions: state.transactions }));
  }, [state.role, state.theme, state.transactions]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
