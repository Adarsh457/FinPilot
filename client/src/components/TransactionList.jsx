import { useState } from "react";
import toast from "react-hot-toast";
import { updateTransaction, deleteTransaction } from "../api";
import { theme } from "../theme";

function TransactionList({ transactions, onChanged }) {
  const [editingId, setEditingId] = useState(null);

  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>Transactions</h2>
      {transactions.length === 0 ? (
        <p style={{ color: theme.colors.muted, margin: 0, fontSize: 14 }}>
          No transactions yet. Add one on the left to get started.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {transactions.map((t) =>
            editingId === t.id ? (
              <EditRow
                key={t.id}
                transaction={t}
                onDone={() => setEditingId(null)}
                onChanged={onChanged}
              />
            ) : (
              <ViewRow
                key={t.id}
                transaction={t}
                onEdit={() => setEditingId(t.id)}
                onChanged={onChanged}
              />
            )
          )}
        </ul>
      )}
    </section>
  );
}

function ViewRow({ transaction: t, onEdit, onChanged }) {
  const income = t.type === "income";

  async function handleDelete() {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(t.id);
      toast.success("Transaction deleted");
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <li style={rowStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ ...dot, background: income ? theme.colors.income : theme.colors.expense }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: theme.colors.ink }}>
            {t.description || t.category}
          </div>
          <div style={{ fontSize: 12, color: theme.colors.muted }}>{t.category}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontFamily: theme.font.display, fontWeight: 600, fontSize: 15,
          fontVariantNumeric: "tabular-nums",
          color: income ? theme.colors.income : theme.colors.expense,
        }}>
          {income ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
        </span>
        <button onClick={onEdit} style={iconButton} title="Edit">✎</button>
        <button onClick={handleDelete} style={{ ...iconButton, color: theme.colors.expense }} title="Delete">🗑</button>
      </div>
    </li>
  );
}

function EditRow({ transaction: t, onDone, onChanged }) {
  const [amount, setAmount] = useState(t.amount);
  const [category, setCategory] = useState(t.category);
  const [type, setType] = useState(t.type);
  const [description, setDescription] = useState(t.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!amount || !category) {
      toast.error("Amount and category are required.");
      return;
    }
    setSaving(true);
    try {
      await updateTransaction(t.id, {
        amount: parseFloat(amount),
        category,
        type,
        description,
      });
      toast.success("Transaction updated");
      onChanged();
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li style={{ ...rowStyle, flexWrap: "wrap", gap: 8 }}>
      <input style={editInput} type="number" value={amount}
        onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
      <input style={editInput} value={category}
        onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      <select style={editInput} value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <input style={{ ...editInput, flex: 1 }} value={description}
        onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <button onClick={handleSave} disabled={saving} style={saveButton}>
        {saving ? "…" : "Save"}
      </button>
      <button onClick={onDone} style={cancelButton}>Cancel</button>
    </li>
  );
}

const cardStyle = {
  padding: 20, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const headingStyle = {
  margin: "0 0 8px", fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.colors.ink,
};
const rowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "12px 0", borderBottom: `1px solid ${theme.colors.border}`,
};
const dot = { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 };
const iconButton = {
  border: "none", background: "transparent", cursor: "pointer",
  fontSize: 15, color: theme.colors.muted, padding: "2px 4px",
};
const editInput = {
  padding: "8px 10px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  fontSize: 13, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff", width: 110,
};
const saveButton = {
  padding: "8px 14px", border: "none", borderRadius: theme.radius.sm,
  background: theme.colors.brand, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const cancelButton = {
  padding: "8px 14px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  background: "#fff", color: theme.colors.ink, fontSize: 13, fontWeight: 600, cursor: "pointer",
};

export default TransactionList;