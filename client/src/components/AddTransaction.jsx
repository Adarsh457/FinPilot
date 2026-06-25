import { useState } from "react";
import { createTransaction } from "../api";
import toast from "react-hot-toast";
import { theme } from "../theme";

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm, fontSize: 14, fontFamily: theme.font.body,
  color: theme.colors.ink, background: "#fff",
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: theme.colors.muted, marginBottom: 6,
};

function AddTransaction({ onAdded }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!amount || !category) {
      toast.error("Please enter an amount and a category.");
      return;
    }
    setSaving(true);
    try {
      await createTransaction({ amount: parseFloat(amount), category, type, description });
      setAmount(""); setCategory(""); setDescription(""); setType("expense");
      toast.success("Transaction added");
      onAdded();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>Add a transaction</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Amount (₹)</label>
            <input style={inputStyle} type="number" placeholder="0"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Type</label>
            <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} placeholder="e.g. food, rent, salary"
            value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Description (optional)</label>
          <input style={inputStyle} placeholder="e.g. Monthly groceries"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button onClick={handleAdd} disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Adding…" : "Add transaction"}
        </button>
      </div>
    </section>
  );
}

const cardStyle = {
  flex: "1 1 300px", padding: 20, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.card,
};
const headingStyle = {
  margin: "0 0 16px", fontFamily: theme.font.display, fontSize: 18,
  fontWeight: 600, color: theme.colors.ink,
};
const primaryButton = {
  padding: "11px 16px", border: "none", borderRadius: theme.radius.sm,
  background: theme.colors.brand, color: "#fff", fontSize: 14,
  fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer",
};

export default AddTransaction;