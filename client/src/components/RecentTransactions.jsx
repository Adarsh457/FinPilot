import { theme } from "../theme";

function RecentTransactions({ transactions }) {
  const recent = [...transactions].slice(-5).reverse();

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 18, fontWeight: 600, color: theme.colors.ink }}>
            Recent Transactions
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.colors.muted }}>Your latest activity</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p style={{ color: theme.colors.muted, fontSize: 14, marginTop: 16 }}>No transactions yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr>
              {["Transaction", "Category", "Date", "Amount"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => {
              const income = t.type === "income";
              return (
                <tr key={t.id} style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 500, color: theme.colors.ink }}>{t.description || t.category}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={tagStyle}>{t.category}</span>
                  </td>
                  <td style={{ ...tdStyle, color: theme.colors.muted, fontSize: 13 }}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontFamily: theme.font.display, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: income ? theme.colors.income : theme.colors.expense }}>
                    {income ? "+" : "−"}₹{Number(t.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const panelStyle = {
  padding: 20, background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.card, marginTop: 20,
};
const thStyle = {
  textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
  color: theme.colors.muted, padding: "8px 0",
};
const tdStyle = { padding: "12px 0", fontSize: 14 };
const tagStyle = {
  display: "inline-block", padding: "3px 10px", background: theme.colors.brandSoft,
  color: theme.colors.brand, borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: "capitalize",
};

export default RecentTransactions;