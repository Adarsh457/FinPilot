import { useState, useEffect } from "react";
import { getTransactions, getSummary } from "./api";
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

  async function loadData() {
    try {
      const [tx, sum] = await Promise.all([getTransactions(), getSummary()]);
      setTransactions(tx);
      setSummary(sum);
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
        <button onClick={handleLogout} style={logoutButton}>Log out</button>
      </header>

      <SummaryCards summary={summary} />

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch", marginBottom: 16 }}>
        <AddTransaction onAdded={loadData} />
        <AskFinPilot />
      </div>

      <TransactionList transactions={transactions} />
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

export default App;