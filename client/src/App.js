import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { theme } from "./theme";
import { getTransactions, getSummary, getMe, getInsight, getBudgets, getDashboardStats } from "./api";
import AuthScreen from "./components/Authscreen";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./components/Dashboard";
import TransactionsPage from "./components/TransactionsPage";
import BudgetPlanner from "./components/BudegetPlanner";

const TOKEN_KEY = "finpilot_token";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [insight, setInsight] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  async function loadData() {
    try {
      const [me, tx, sum, buds, dstats] = await Promise.all([getMe(), getTransactions(), getSummary(), getBudgets(), getDashboardStats()]);
      setUser(me);
      setTransactions(tx);
      setSummary(sum);
      setBudgets(buds);
      setStats(dstats);
      buds.forEach((b) => {
        if (b.status === "over") toast.error(`You're over your ${b.category} budget! (${b.percentage}%)`);
        else if (b.status === "warning") toast(`Heads up: ${b.percentage}% of your ${b.category} budget used.`, { icon: "⚠️" });
      });
      getInsight().then((data) => setInsight(data)).catch(() => {});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  function handleAuth(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setLoading(true);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setInsight(null);
    setBudgets([]);
    setTransactions([]);
    setSummary(null);
    setStats(null);
    toast.success("Logged out");
  }

  const shared = { transactions, summary, budgets, insight, stats, loadData, loading };

  return (
    <BrowserRouter>
      <AppToaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <AuthScreen initialMode="login" onAuth={handleAuth} />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <AuthScreen initialMode="register" onAuth={handleAuth} />} />

        {/* Protected routes */}
        <Route element={token ? <Layout user={user} onLogout={handleLogout} loadData={loadData} /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard {...shared} />} />
          <Route path="/transactions" element={<TransactionsPage {...shared} />} />
          <Route path="/budgets" element={<BudgetPlanner {...shared} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontFamily: theme.font.body, fontSize: 14, borderRadius: 10, border: `1px solid ${theme.colors.border}`, color: theme.colors.ink },
        success: { iconTheme: { primary: theme.colors.income, secondary: "#fff" } },
        error: { iconTheme: { primary: theme.colors.expense, secondary: "#fff" } },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {icon}
              <span style={{ flex: 1 }}>{message}</span>
              {t.type !== "loading" && (
                <button onClick={() => toast.dismiss(t.id)} aria-label="Close"
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: theme.colors.muted, fontSize: 16, lineHeight: 1, padding: "2px 6px" }}>
                  ✕
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}

export default App;