import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, register } from "../api";
import { theme } from "../theme";

function AuthScreen({ onAuth, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === "login";

  function validate() {
    const name = username.trim();
    if (name.length < 3) { toast.error("Username must be at least 3 characters."); return false; }
    if (!/[a-zA-Z]/.test(name)) { toast.error("Username must contain at least one letter."); return false; }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) { toast.error("Username can only use letters, numbers, and underscores."); return false; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return false; }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setBusy(true);
    try {
      if (isLogin) {
        const data = await login(username.trim(), password);
        toast.success("Welcome back!");
        onAuth(data.access_token);
      } else {
        await register(username.trim(), password);
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
    <div style={wrapStyle}>
      {/* LEFT — branded panel */}
      <div  className="fp-brand-panel" style={brandPanel}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={logoMark}>✦</div>
          <span style={{ color: "#fff", fontFamily: theme.font.display, fontWeight: 700, fontSize: 20 }}>FinPilot</span>
        </div>

        <div>
          <h2 style={brandHeadline}>Your money, finally under control.</h2>
          <p style={brandSub}>Track spending, set budgets, scan receipts, and get AI insights — all in one place.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {[
              ["📊", "Track every rupee automatically"],
              ["🎯", "Smart budgets that warn you early"],
              ["✦", "AI that reads receipts & answers questions"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={brandBullet}>{icon}</div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Built with React, FastAPI & Gemini</div>
      </div>

      {/* RIGHT — the form */}
      <div style={formSide}>
        <div style={cardStyle}>
          <h1 style={{ margin: "0 0 4px", fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.colors.ink }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: theme.colors.muted }}>
            {isLogin ? "Log in to continue to FinPilot." : "Start managing your money in seconds."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} placeholder="e.g. adarsh"
                value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: 44 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"} style={eyeButton}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={busy} className="fp-btn" style={{ ...primaryButton, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
            </button>
          </div>

          <p style={{ marginTop: 20, marginBottom: 0, fontSize: 13, color: theme.colors.muted, textAlign: "center" }}>
            {isLogin ? "New here? " : "Already have an account? "}
            <button onClick={() => { setMode(isLogin ? "register" : "login"); setPassword(""); }} style={linkButton}>
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const wrapStyle = { display: "flex", minHeight: "100vh" };
const brandPanel = {
  flex: "1 1 45%", background: theme.colors.sidebar, padding: "48px 44px",
  display: "flex", flexDirection: "column", justifyContent: "space-between",
};
const brandHeadline = {
  margin: "0 0 12px", fontFamily: theme.font.display, fontSize: 30, fontWeight: 700,
  color: "#fff", lineHeight: 1.2,
};
const brandSub = { margin: 0, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 380 };
const brandBullet = {
  width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.1)",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0,
};
const formSide = {
  flex: "1 1 55%", background: theme.colors.bg,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
};
const cardStyle = {
  width: "100%", maxWidth: 380, padding: 32, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, boxShadow: theme.shadow.lg,
};
const logoMark = {
  width: 40, height: 40, borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: theme.shadow.raised,
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: theme.colors.muted, marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "11px 12px", border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm, fontSize: 14, fontFamily: theme.font.body, color: theme.colors.ink, background: "#fff", boxSizing: "border-box",
};
const eyeButton = {
  position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
  border: "none", background: "transparent", cursor: "pointer", fontSize: 16, padding: "4px 8px", lineHeight: 1,
};
const primaryButton = {
  padding: "12px 16px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", marginTop: 4,
};
const linkButton = {
  border: "none", background: "transparent", color: theme.colors.brand, fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0,
};

export default AuthScreen;