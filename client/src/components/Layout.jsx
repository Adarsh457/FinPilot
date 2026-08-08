import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AddTransactionModal from "./AddTransactionModal";
import { theme } from "../theme";

function Layout({ user, onLogout, loadData }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.bg }}>
      <Sidebar
        user={user}
        onLogout={onLogout}
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      {/* dark overlay behind the open sidebar on mobile */}
      <div
        className={`fp-overlay${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <main className="fp-main" style={{ marginLeft: 240 }}>
        {/* hamburger — only visible on mobile via CSS */}
        <button
          className="fp-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          style={hamburgerStyle}
        >
          ☰
        </button>

        <div style={{ padding: "24px 20px 64px", maxWidth: 1200, margin: "0 auto" }}>
          <Outlet context={{ openAddModal: () => setModalOpen(true) }} />
        </div>
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={loadData} />
    </div>
  );
}

const hamburgerStyle = {
  alignItems: "center", justifyContent: "center",
  width: 42, height: 42, margin: "16px 0 0 16px", borderRadius: 10,
  border: `1px solid ${theme.colors.border}`, background: theme.colors.surface,
  fontSize: 20, cursor: "pointer", color: theme.colors.ink,
};

export default Layout;