import { useState, useEffect } from "react";
import { getTransactions, getSummary } from "./api";
import { theme } from "./theme";
import SummaryCards from "./components/SummaryCard";
import AddTransaction from "./components/AddTransaction";
import AskFinPilot from "./components/AskFinpilot";
import TransactionList from "./components/TransactionList";

function App() {
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

  useEffect(() => { loadData(); }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (error)
    return <p style={{ padding: 24, color: theme.colors.expense }}>{error}. Is the backend running on port 8000?</p>;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "40px 20px 64px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={logoMark}>✦</div>
        <div>
          <h1 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.colors.ink }}>
            FinPilot
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.colors.muted }}>
            Track your money. Ask the AI. Stay on course.
          </p>
        </div>
      </header>

      <SummaryCards summary={summary} />

      {/* Left: add form  ·  Right: Ask FinPilot */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch", marginBottom: 16 }}>
        <AddTransaction onAdded={loadData} />
        <AskFinPilot />
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}

const logoMark = {
  width: 40, height: 40, borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 20, boxShadow: theme.shadow.raised,
};

export default App;