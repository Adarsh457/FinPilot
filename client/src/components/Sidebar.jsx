import { NavLink } from "react-router-dom";
import { theme } from "../theme";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/transactions", label: "Transactions", icon: "⇅" },
  { to: "/budgets", label: "Budget Planner", icon: "◔" },
];

function navLinkStyle({ isActive }) {
  return {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px", borderRadius: 10,
    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
    background: isActive ? theme.colors.brand : "transparent",
    textDecoration: "none", fontSize: 14, fontWeight: isActive ? 600 : 500,
  };
}

function Sidebar({ user, onLogout }) {
  return (
    <aside style={sidebarStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 }}>
        <div style={logoMark}>✦</div>
        <div>
          <div style={{ color: "#fff", fontFamily: theme.font.display, fontWeight: 700, fontSize: 16 }}>FinPilot</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>Personal Finance</div>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", padding: "0 12px", marginBottom: 8 }}>
        MENU
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} style={navLinkStyle}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.06)", marginBottom: 10 }}>
            <div style={avatarCircle}>{user.username.charAt(0).toUpperCase()}</div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.username}
            </div>
          </div>
        )}
        <button onClick={onLogout} style={logoutButton}>Log out</button>
      </div>
    </aside>
  );
}

const sidebarStyle = {
  position: "fixed", top: 0, left: 0, width: 240, height: "100vh",
  background: theme.colors.sidebar, display: "flex", flexDirection: "column",
  padding: "24px 16px", boxSizing: "border-box",
};
const logoMark = {
  width: 38, height: 38, borderRadius: 11,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 18, boxShadow: theme.shadow.raised,
};
const avatarCircle = {
  width: 32, height: 32, borderRadius: "50%",
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 14, fontWeight: 700, fontFamily: theme.font.display, flexShrink: 0,
};
const logoutButton = {
  width: "100%", padding: "10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
  background: "transparent", color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};

export default Sidebar;