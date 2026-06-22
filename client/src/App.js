import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");

  async function loadData() {
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`${API}/transactions`),
        fetch(`${API}/summary`),
      ]);
      if (!txRes.ok || !sumRes.ok) throw new Error("Request failed");
      setTransactions(await txRes.json());
      setSummary(await sumRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd() {
    if (!amount || !category) {
      alert("Please enter an amount and a category.");
      return;
    }
    try {
      const res = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          type,
          description,
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      // clear the form
      setAmount("");
      setCategory("");
      setDescription("");
      setType("expense");
      // refresh the screen with the new data
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (error)
    return (
      <p style={{ padding: 24, color: "crimson" }}>
        Error: {error}. Is the backend running on port 8000?
      </p>
    );

  const inputStyle = { padding: 8, border: "1px solid #ccc", borderRadius: 6 };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>FinPilot</h1>

      {summary && (
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Card label="Income" value={summary.total_income} color="green" />
          <Card label="Expense" value={summary.total_expense} color="crimson" />
          <Card label="Balance" value={summary.balance} color="#333" />
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
          padding: 16,
          border: "1px solid #eee",
          borderRadius: 8,
        }}
      >
        <input
          style={inputStyle}
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Category (e.g. food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          style={inputStyle}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {transactions.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {t.description || t.category}{" "}
                <small style={{ color: "#888" }}>({t.category})</small>
              </span>
              <span style={{ color: t.type === "income" ? "green" : "crimson" }}>
                {t.type === "income" ? "+" : "-"}₹{t.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
      <div style={{ fontSize: 13, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color }}>₹{value}</div>
    </div>
  );
}

export default App;