import { useState, useEffect } from "react";
import { getTransactions, getSummary, getMe, getInsight } from "./api";
import { Toaster, ToastBar, toast } from "react-hot-toast";
import { theme } from "./theme";
import SummaryCards from "./components/SummaryCard";
import AddTransaction from "./components/AddTransaction";
import AskFinPilot from "./components/AskFinpilot";
import TransactionList from "./components/TransactionList";
import AuthScreen from "./components/Authscreen";

const TOKEN_KEY = "finpilot_token";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [insight, setInsight] = useState(null);

  async function loadData() {
    try {
      const [me, tx, sum] = await Promise.all([getMe(), getTransactions(), getSummary()]);
      setUser(me);
      setTransactions(tx);
      setSummary(sum);
      getInsight().then((data) => setInsight(data)).catch(() => {});
    } catch (err) {
      setError(err.message);
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
    setInsight("");
    setTransactions([]);
    setSummary(null);
    toast.success("Logged out");
  }

  // Not logged in → show the auth screen
  if (!token) {
    return (
      <>
        <AppToaster />
        <AuthScreen onAuth={handleAuth} />
      </>
    );
  }

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (error)
    return <p style={{ padding: 24, color: theme.colors.expense }}>{error}. Is the backend running on port 8000?</p>;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "40px 20px 64px" }}>
      <AppToaster />

      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={logoMark}>✦</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.colors.ink }}>
            FinPilot
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.colors.muted }}>
            Track your money. Ask the AI. Stay on course.
          </p>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={avatarCircle}>{user.username.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.colors.ink }}>
              Hello! {user.username}
            </span>
          </div>
        )}
        <button onClick={handleLogout} style={logoutButton}>Log out</button>
      </header>

      <SummaryCards summary={summary} />
      
      {insight && insight.expense_pct !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 24,
          padding: "14px 18px", background: theme.colors.brandSoft,
          border: `1px solid ${theme.colors.border}`, borderLeft: `3px solid ${theme.colors.brand}`,
          borderRadius: theme.radius.md,
        }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Spent</div>
              <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.colors.expense }}>
                {insight.expense_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Saved</div>
              <div style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.colors.income }}>
                {insight.savings_pct}%
              </div>
            </div>
          </div>
          <span style={{ fontSize: 14, color: theme.colors.ink, lineHeight: 1.5, flex: 1, minWidth: 200 }}>
            {insight.comment}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch", marginBottom: 16 }}>
        <AddTransaction onAdded={loadData} />
        <AskFinPilot />
      </div>

      <TransactionList transactions={transactions} onChanged={loadData} />
    </div>
  );
}

// One themed Toaster (with close button) reused on both the auth screen and the app
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

const logoMark = {
  width: 40, height: 40, borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: theme.shadow.raised,
};
const logoutButton = {
  padding: "8px 14px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  background: "#fff", color: theme.colors.ink, fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const avatarCircle = {
  width: 34, height: 34, borderRadius: "50%",
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 15, fontWeight: 700, fontFamily: theme.font.display,
};

export default App;