import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { updateTransaction, deleteTransaction } from "../api";
import { theme } from "../theme";

function TransactionsPage({ transactions, loadData }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);

  // unique categories for the dropdown
  const categories = useMemo(() => {
    return ["all", ...new Set(transactions.map((t) => t.category))];
  }, [transactions]);

  // apply search + filters
  const filtered = useMemo(() => {
    return [...transactions].reverse().filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hit = (t.description || "").toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  // totals for the filtered rows (the footer)
  const totals = useMemo(() => {
    let income = 0, expense = 0;
    filtered.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense };
  }, [filtered]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 style={pageTitle}>Transactions</h1>
          <p style={pageSubtitle}>{filtered.length} of {transactions.length} records</p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={filterBar}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          placeholder="Search by description or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* All / Income / Expenses toggle */}
        <div style={toggleWrap}>
          {[["all", "All"], ["income", "Income"], ["expense", "Expenses"]].map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              style={{ ...toggleBtn, ...(typeFilter === val ? toggleActive : {}) }}>
              {label}
            </button>
          ))}
        </div>

        <select style={inputStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={panelStyle}>
        {filtered.length === 0 ? (
          <p style={{ color: theme.colors.muted, fontSize: 14, padding: 8 }}>No transactions match your filters.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Transaction", "Category", "Date", "Amount", ""].map((h, i) => (
                  <th key={i} style={{ ...thStyle, textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) =>
                editingId === t.id ? (
                  <EditRow key={t.id} t={t} onDone={() => setEditingId(null)} loadData={loadData} />
                ) : (
                  <ViewRow key={t.id} t={t} onEdit={() => setEditingId(t.id)} loadData={loadData} />
                )
              )}
            </tbody>
          </table>
        )}
        {/* footer totals */}
        {filtered.length > 0 && (
          <div style={footerStyle}>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.muted }}>
              Total Filtered Records: {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              <span style={{ fontSize: 13 }}>
                <span style={{ color: theme.colors.muted }}>Income: </span>
                <span style={{ fontWeight: 700, color: theme.colors.income, fontFamily: theme.font.display }}>
                  +₹{Number(totals.income).toLocaleString("en-IN")}
                </span>
              </span>
              <span style={{ fontSize: 13 }}>
                <span style={{ color: theme.colors.muted }}>Expense: </span>
                <span style={{ fontWeight: 700, color: theme.colors.expense, fontFamily: theme.font.display }}>
                  −₹{Number(totals.expense).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewRow({ t, onEdit, loadData }) {
  const income = t.type === "income";

  async function handleDelete() {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(t.id);
      toast.success("Deleted");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <tr style={{ borderTop: `1px solid ${theme.colors.border}` }}>
      <td style={tdStyle}>
        <div style={{ fontWeight: 500, color: theme.colors.ink }}>{t.description || t.category}</div>
      </td>
      <td style={tdStyle}><span style={tagStyle}>{t.category}</span></td>
      <td style={{ ...tdStyle, color: theme.colors.muted, fontSize: 13 }}>
        {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </td>
      <td style={{ ...tdStyle, textAlign: "right", fontFamily: theme.font.display, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: income ? theme.colors.income : theme.colors.expense }}>
        {income ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
      </td>
      <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
        <button onClick={onEdit} style={iconBtn} title="Edit">✎</button>
        <button onClick={handleDelete} style={{ ...iconBtn, color: theme.colors.expense }} title="Delete">🗑</button>
      </td>
    </tr>
  );
}

function EditRow({ t, onDone, loadData }) {
  const [amount, setAmount] = useState(t.amount);
  const [category, setCategory] = useState(t.category);
  const [type, setType] = useState(t.type);
  const [description, setDescription] = useState(t.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!amount || !category) { toast.error("Amount and category required."); return; }
    setSaving(true);
    try {
      await updateTransaction(t.id, { amount: parseFloat(amount), category, type, description });
      toast.success("Updated");
      loadData();
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr style={{ borderTop: `1px solid ${theme.colors.border}`, background: theme.colors.bg }}>
      <td style={tdStyle}>
        <input style={editInput} value={description} placeholder="Description"
          onChange={(e) => setDescription(e.target.value)} />
      </td>
      <td style={tdStyle}>
        <input style={{ ...editInput, width: 100 }} value={category}
          onChange={(e) => setCategory(e.target.value)} />
      </td>
      <td style={tdStyle}>
        <select style={{ ...editInput, width: 100 }} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </td>
      <td style={{ ...tdStyle, textAlign: "right" }}>
        <input style={{ ...editInput, width: 90 }} type="number" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
      </td>
      <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
        <button onClick={handleSave} disabled={saving} style={saveBtn}>{saving ? "…" : "Save"}</button>
        <button onClick={onDone} style={iconBtn}>✕</button>
      </td>
    </tr>
  );
}

const pageTitle = { margin: "0 0 2px", fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.colors.ink };
const pageSubtitle = { margin: 0, fontSize: 14, color: theme.colors.muted };
const filterBar = {
  display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16, marginTop: 20,
  padding: 14, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const inputStyle = {
  padding: "9px 12px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  fontSize: 14, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff",
};
const toggleWrap = {
  display: "flex", background: theme.colors.bg, borderRadius: theme.radius.sm, padding: 3, gap: 2,
};
const toggleBtn = {
  padding: "6px 14px", border: "none", background: "transparent", cursor: "pointer",
  fontSize: 13, fontWeight: 600, color: theme.colors.muted, borderRadius: 6,
};
const toggleActive = { background: theme.colors.surface, color: theme.colors.ink, boxShadow: theme.shadow.card };
const panelStyle = {
  padding: 20, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const thStyle = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
  color: theme.colors.muted, padding: "8px 0",
};
const tdStyle = { padding: "12px 8px 12px 0", fontSize: 14 };
const tagStyle = {
  display: "inline-block", padding: "3px 10px", background: theme.colors.brandSoft,
  color: theme.colors.brand, borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: "capitalize",
};
const iconBtn = {
  border: "none", background: "transparent", cursor: "pointer", fontSize: 14,
  color: theme.colors.muted, padding: "2px 5px",
};
const editInput = {
  padding: "7px 9px", border: `1px solid ${theme.colors.border}`, borderRadius: 6,
  fontSize: 13, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff", width: "100%", boxSizing: "border-box",
};
const saveBtn = {
  padding: "7px 12px", border: "none", borderRadius: 6, background: theme.colors.brand,
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", marginRight: 4,
};
const footerStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
  marginTop: 8, paddingTop: 16, borderTop: `2px solid ${theme.colors.border}`,
};

export default TransactionsPage;