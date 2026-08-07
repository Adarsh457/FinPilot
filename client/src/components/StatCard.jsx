import { theme } from "../theme";

function StatCard({ label, value, sub, subColor, icon, accent }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: theme.colors.muted }}>
          {label}
        </span>
        <div style={{ ...iconBox, background: (accent || theme.colors.brand) + "18", color: accent || theme.colors.brand }}>
          {icon}
        </div>
      </div>
      <div style={{ marginTop: 10, fontFamily: theme.font.display, fontSize: 28, fontWeight: 700, color: theme.colors.ink, fontVariantNumeric: "tabular-nums" }}>
        ₹{Number(value).toLocaleString("en-IN")}
      </div>
      {sub && (
        <div style={{ marginTop: 6, fontSize: 13, color: subColor || theme.colors.muted }}>{sub}</div>
      )}
    </div>
  );
}

const cardStyle = {
  flex: "1 1 200px", padding: 20, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const iconBox = {
  width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
};

export default StatCard;