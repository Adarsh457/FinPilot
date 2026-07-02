import { useState } from "react";
import toast from "react-hot-toast";
import { login, register } from "../api";
import { theme } from "../theme";

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter a username and password.");
      return;
    }
    setBusy(true);
    try {
      if (isLogin) {
        const data = await login(username, password);
        toast.success("Welcome back!");
        onAuth(data.access_token);
      } else {
        // Register only — then send them to the login screen
        await register(username, password);
        toast.success("Account created! Please log in.");
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={logoMark}>✦</div>
          <div>
            <h1 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 22, fontWeight: 700, color: theme.colors.ink }}>
              FinPilot
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: theme.colors.muted }}>
              {isLogin ? "Log in to your account" : "Create your account"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input style={inputStyle} placeholder="e.g. adarsh"
              value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <button onClick={handleSubmit} disabled={busy} style={{ ...primaryButton, opacity: busy ? 0.7 : 1 }}>
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </div>

        <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: theme.colors.muted, textAlign: "center" }}>
          {isLogin ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(isLogin ? "register" : "login")} style={linkButton}>
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

const pageStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const cardStyle = {
  width: "100%", maxWidth: 380, padding: 28, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const logoMark = {
  width: 40, height: 40, borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: theme.shadow.raised,
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: theme.colors.muted, marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm, fontSize: 14, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff",
};
const primaryButton = {
  padding: "11px 16px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", marginTop: 4,
};
const linkButton = {
  border: "none", background: "transparent", color: theme.colors.brand, fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0,
};

export default AuthScreen;