import { useState } from "react";
import toast from "react-hot-toast";
import { setBudget, deleteBudget } from "../api";
import { theme } from "../theme";
import Modal from "./Modal";

const CATEGORIES = ["food", "rent", "bills", "transport", "shopping", "entertainment", "health"];

function Budgets({ budgets, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("food");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);

  // totals for the dark banner
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const poolPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const remaining = totalLimit - totalSpent;

  async function handleSet() {
    if (!limit || parseFloat(limit) <= 0) {
      toast.error("Enter a valid limit amount.");
      return;
    }
    setSaving(true);
    try {
      await setBudget(category, parseFloat(limit));
      setLimit("");
      toast.success("Budget saved");
      onChanged();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this budget?")) return;
    try {
      await deleteBudget(id);
      toast.success("Budget removed");
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      {/* header row: title + add budget */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.colors.ink }}>
          Budget Allocations & Limits
        </h2>
        <button onClick={() => setModalOpen(true)} style={addButton}>+ New Budget</button>
      </div>

      {/* dark total pool banner */}
      <div style={poolBanner}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
            TOTAL MONTHLY BUDGET POOL
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: theme.font.display, fontSize: 34, fontWeight: 700, color: "#fff" }}>
              ₹{Number(totalSpent).toLocaleString("en-IN")}
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
              of ₹{Number(totalLimit).toLocaleString("en-IN")} spent
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            Remaining: <span style={{ color: remaining >= 0 ? "#4ADE80" : "#F87171", fontWeight: 600 }}>
              ₹{Number(remaining).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <div style={{ minWidth: 240, flex: 1, maxWidth: 380 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            <span>Overall Pool Utilization</span>
            <span style={{ fontWeight: 700, color: "#fff" }}>{poolPct}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(poolPct, 100)}%`, background: poolPct >= 100 ? theme.colors.expense : theme.colors.brand, transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      {/* budget cards */}
      {budgets.length === 0 ? (
        <div style={emptyStyle}>
          No budgets yet. Click <b>+ New Budget</b> to set your first spending limit.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {budgets.map((b) => (
            <BudgetCard key={b.id} b={b} onDelete={() => handleDelete(b.id)} />
          ))}
        </div>
      )}

      {/* add-budget modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Budget Category">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Monthly limit (₹)</label>
            <input style={inputStyle} type="number" placeholder="e.g. 5000"
              value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <button onClick={handleSet} disabled={saving} style={{ ...addButton, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save budget"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function BudgetCard({ b, onDelete }) {
  const config = {
    over: { color: theme.colors.expense, label: "Exceeded", pillBg: "#FDECEC", pillColor: theme.colors.expense },
    warning: { color: theme.colors.warning, label: "Near Limit", pillBg: "#FEF3E2", pillColor: "#B45309" },
    ok: { color: theme.colors.income, label: "Within Limit", pillBg: "#E7F6EF", pillColor: theme.colors.income },
  }[b.status];

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={cardIcon}>◔</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: theme.colors.ink, textTransform: "capitalize" }}>{b.category}</div>
            <div style={{ fontSize: 11, letterSpacing: "0.06em", color: theme.colors.muted }}>MONTHLY</div>
          </div>
        </div>
        <button onClick={onDelete} style={deleteBtn} title="Remove">✕</button>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
        <span style={{ fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.colors.ink }}>
          ₹{Number(b.spent).toLocaleString("en-IN")}
        </span>
        <span style={{ fontSize: 14, color: theme.colors.muted }}>/ ₹{Number(b.limit_amount).toLocaleString("en-IN")}</span>
      </div>

      <div style={{ height: 8, background: theme.colors.border, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${Math.min(b.percentage, 100)}%`, background: config.color, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: theme.colors.muted }}>{b.percentage}% used</span>
        <span style={{ ...pill, background: config.pillBg, color: config.pillColor }}>{config.label}</span>
      </div>
    </div>
  );
}

const addButton = {
  padding: "10px 16px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", whiteSpace: "nowrap",
};
const poolBanner = {
  display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20,
  padding: 24, background: theme.colors.sidebar, borderRadius: theme.radius.xl, marginBottom: 20,
};
const cardStyle = {
  padding: 20, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const cardIcon = {
  width: 36, height: 36, borderRadius: 10, background: theme.colors.brandSoft, color: theme.colors.brand,
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
};
const pill = {
  display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 20,
  fontSize: 12, fontWeight: 600,
};
const deleteBtn = { border: "none", background: "transparent", cursor: "pointer", color: theme.colors.muted, fontSize: 14, padding: 2 };
const emptyStyle = {
  padding: 40, textAlign: "center", color: theme.colors.muted, fontSize: 14,
  background: theme.colors.surface, border: `1px dashed ${theme.colors.border}`, borderRadius: theme.radius.lg,
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: theme.colors.muted, marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  fontSize: 14, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff", boxSizing: "border-box",
};

export default Budgets;