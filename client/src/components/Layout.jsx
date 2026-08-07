import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddTransactionModal from "./AddTransactionModal";
import { theme } from "../theme";

function Layout({ user, onLogout, loadData }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.bg }}>
      <Sidebar user={user} onLogout={onLogout} />

      <main style={{ marginLeft: 240 }}>
        {/* top bar with the always-available New Transaction button */}
        <div style={topBar}>
          <div style={{ fontSize: 13, color: theme.colors.muted }}>
            Welcome back{user ? `, ${user.username}` : ""} 👋
          </div>
          <button onClick={() => setModalOpen(true)} style={newButton}>+ New Transaction</button>
        </div>

        <div style={{ padding: "24px 40px 64px", maxWidth: 1200 }}>
          <Outlet />
        </div>
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={loadData} />
    </div>
  );
}

const topBar = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 40px", background: theme.colors.surface,
  borderBottom: `1px solid ${theme.colors.border}`, position: "sticky", top: 0, zIndex: 100,
};
const newButton = {
  padding: "10px 18px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", whiteSpace: "nowrap",
};

export default Layout;