import { useState } from "react";
import toast from "react-hot-toast";
import { createTransaction, scanReceipt } from "../api";
import { theme } from "../theme";
import Modal from "./Modal";

const CATEGORIES = ["food", "rent", "bills", "transport", "shopping", "entertainment", "health", "salary", "other"];

function AddTransactionModal({ open, onClose, onAdded }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const finalCategory = category === "other" ? customCategory.trim() : category;

  function reset() {
    setAmount(""); setCategory("food"); setCustomCategory(""); setType("expense"); setDescription("");
  }

  async function handleScan(e) {
    const chosen = e.target.files[0];
    if (!chosen) return;
    setScanning(true);
    try {
      const data = await scanReceipt(chosen);
      setAmount(String(data.amount));
      if (CATEGORIES.includes(data.category)) {
        setCategory(data.category);
      } else {
        setCategory("other");
        setCustomCategory(data.category);
      }
      setType(data.type || "expense");
      setDescription(data.description || "");
      toast.success("Receipt scanned — review and save");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setScanning(false);
      e.target.value = ""; // reset so the same file can be re-picked
    }
  }

  async function handleAdd() {
    if (!amount || !finalCategory) {
      toast.error("Please enter an amount and a category.");
      return;
    }
    setSaving(true);
    try {
      await createTransaction({ amount: parseFloat(amount), category: finalCategory, type, description });
      toast.success("Transaction added");
      reset();
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Transaction">
      {/* Receipt scan area */}
      <label style={scanBox}>
        <span style={{ fontSize: 20 }}>📷</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.brand }}>
          {scanning ? "Reading your receipt…" : "Scan a receipt — AI fills the form for you"}
        </span>
        <input type="file" accept="image/*" onChange={handleScan} disabled={scanning} style={{ display: "none" }} />
      </label>

      <div style={{ textAlign: "center", fontSize: 12, color: theme.colors.muted, margin: "12px 0" }}>
        — or enter manually —
      </div>

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
          <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {category === "other" && (
          <div>
            <label style={labelStyle}>Custom category</label>
            <input style={inputStyle} placeholder="Type your category"
              value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
          </div>
        )}

        <div>
          <label style={labelStyle}>Description (optional)</label>
          <input style={inputStyle} placeholder="e.g. Monthly groceries"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button onClick={handleAdd} disabled={saving} style={{ ...primaryButton, opacity: saving ? 0.7 : 1 }}>
          {saving ? "Adding…" : "Add transaction"}
        </button>
      </div>
    </Modal>
  );
}

const scanBox = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  padding: "18px", border: `2px dashed ${theme.colors.brand}`, borderRadius: theme.radius.md,
  background: theme.colors.brandSoft, cursor: "pointer", textAlign: "center",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: theme.colors.muted, marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm, fontSize: 14, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff", boxSizing: "border-box",
};
const primaryButton = {
  padding: "11px 16px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer",
};

export default AddTransactionModal;