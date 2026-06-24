import { theme } from "../theme";

function TransactionList({ transactions }) {
  return (
    <section style={cardStyle}>
      <h2 style={headingStyle}>Transactions</h2>
      {transactions.length === 0 ? (
        <p style={{ color: theme.colors.muted, margin: 0, fontSize: 14 }}>
          No transactions yet. Add one on the left to get started.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {transactions.map((t) => {
            const income = t.type === "income";
            return (
              <li key={t.id} style={rowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ ...dot, background: income ? theme.colors.income : theme.colors.expense }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: theme.colors.ink }}>
                      {t.description || t.category}
                    </div>
                    <div style={{ fontSize: 12, color: theme.colors.muted }}>{t.category}</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: theme.font.display, fontWeight: 600, fontSize: 15,
                  fontVariantNumeric: "tabular-nums",
                  color: income ? theme.colors.income : theme.colors.expense,
                }}>
                  {income ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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

export default TransactionList;