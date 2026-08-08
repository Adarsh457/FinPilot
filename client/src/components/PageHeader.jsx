import { theme } from "../theme";

function PageHeader({ title, subtitle, onNew }) {
  return (
    <div className="fp-page-header"  style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: "0 0 2px", fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.colors.ink }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: theme.colors.muted }}>{subtitle}</p>
      </div>
      {onNew && (
        <button onClick={onNew} style={newButton}>+ New Transaction</button>
      )}
    </div>
  );
}

const newButton = {
  padding: "11px 18px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", whiteSpace: "nowrap",
};

export default PageHeader;