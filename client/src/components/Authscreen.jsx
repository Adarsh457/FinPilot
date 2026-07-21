import { useState } from "react";
import toast from "react-hot-toast";
import { login, register } from "../api";
import { theme } from "../theme";

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  function validate() {
    const name = username.trim();
    if (name.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return false;
    }
    // must contain at least one letter (blocks all-number names like "11111111")
    if (!/[a-zA-Z]/.test(name)) {
      toast.error("Username must contain at least one letter.");
      return false;
    }
    // only letters, numbers, and underscores allowed
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast.error("Username can only use letters, numbers, and underscores.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
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
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 44 }}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={eyeButton}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={busy} style={{ ...primaryButton, opacity: busy ? 0.7 : 1 }}>
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </div>

        <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13, color: theme.colors.muted, textAlign: "center" }}>
          {isLogin ? "New here? " : "Already have an account? "}
          <button onClick={() => { setMode(isLogin ? "register" : "login"); setPassword(""); }} style={linkButton}>
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
const eyeButton = {
  position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
  border: "none", background: "transparent", cursor: "pointer", fontSize: 16, padding: "4px 8px", lineHeight: 1,
};
const primaryButton = {
  padding: "11px 16px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", marginTop: 4,
};
const linkButton = {
  border: "none", background: "transparent", color: theme.colors.brand, fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0,
};

export default AuthScreen;