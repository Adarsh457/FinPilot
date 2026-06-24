import { theme } from "../theme";

function Card({ label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 140, padding: "16px 18px",
      background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.radius.md, boxShadow: theme.shadow.card,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
        textTransform: "uppercase", color: theme.colors.muted,
      }}>{label}</div>
      <div style={{
        marginTop: 6, fontFamily: theme.font.display, fontSize: 26, fontWeight: 600,
        color, fontVariantNumeric: "tabular-nums",
      }}>₹{Number(value).toLocaleString("en-IN")}</div>
    </div>
  );
}

function SummaryCards({ summary }) {
  if (!summary) return null;
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
      <Card label="Income" value={summary.total_income} color={theme.colors.income} />
      <Card label="Expense" value={summary.total_expense} color={theme.colors.expense} />
      <Card label="Balance" value={summary.balance} color={theme.colors.ink} />
    </div>
  );
}

export default SummaryCards;