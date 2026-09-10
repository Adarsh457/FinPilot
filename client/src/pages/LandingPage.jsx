import { useNavigate } from "react-router-dom";
import { theme } from "../theme";

const FEATURES = [
  { icon: "📊", title: "Track everything", text: "Log income and expenses by category and watch your balance update instantly." },
  { icon: "🎯", title: "Smart budgets", text: "Set monthly limits per category and get alerted before you overspend." },
  { icon: "✦", title: "AI assistant", text: "Ask about your spending in plain English, and scan receipts to add transactions automatically." },
];

const STEPS = [
  { n: "1", title: "Create your account", text: "Sign up in seconds — just a username and password." },
  { n: "2", title: "Add your money", text: "Log income and expenses, or snap a receipt and let AI fill it in." },
  { n: "3", title: "Stay on track", text: "Set budgets, get alerts, and ask the AI how to save more." },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.bg, display: "flex", flexDirection: "column" }}>
      {/* top nav */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={logoMark}>✦</div>
          <span style={{ fontFamily: theme.font.display, fontWeight: 700, fontSize: 18, color: theme.colors.ink }}>FinPilot</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/login")} style={ghostButton}>Log in</button>
          <button onClick={() => navigate("/signup")} style={primaryButton}>Sign up</button>
        </div>
      </nav>

      {/* hero */}
      <section style={heroStyle}>
        <div style={badge}>✦ AI-powered personal finance</div>
        <h1 style={heroTitle}>Take control of your money with FinPilot</h1>
        <p style={heroSubtitle}>
          Track income and expenses, set smart budgets, scan receipts, and ask an AI
          assistant about your spending — all in one clean, simple app.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/signup")} style={{ ...primaryButton, padding: "14px 28px", fontSize: 16 }}>
            Get Started — it's free
          </button>
          <button onClick={() => navigate("/login")} style={{ ...ghostButton, padding: "14px 28px", fontSize: 16 }}>
            Log in
          </button>
        </div>
      </section>

      {/* features */}
      <section style={featuresWrap}>
        {FEATURES.map((f) => (
          <div key={f.title} style={featureCard}>
            <div style={featureIcon}>{f.icon}</div>
            <h3 style={featureTitle}>{f.title}</h3>
            <p style={featureText}>{f.text}</p>
          </div>
        ))}
      </section>

      {/* how it works */}
      <section style={stepsWrap}>
        <h2 style={sectionTitle}>How it works</h2>
        <div style={stepsRow}>
          {STEPS.map((s) => (
            <div key={s.n} style={stepCard}>
              <div style={stepNum}>{s.n}</div>
              <h3 style={featureTitle}>{s.title}</h3>
              <p style={featureText}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* closing call-to-action band — pinned just above the footer */}
      <section style={ctaBand}>
        <h2 style={{ margin: "0 0 10px", fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: "#fff" }}>
          Ready to take charge of your finances?
        </h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: "rgba(255,255,255,0.75)", maxWidth: 460 }}>
          Join FinPilot and let AI help you spend smarter and save more — starting today.
        </p>
        <button onClick={() => navigate("/signup")} style={ctaButton}>Create your free account</button>
      </section>

      {/* footer sits directly below the dark band */}
      <footer style={footerStyle}>Built with React, FastAPI & Gemini · FinPilot</footer>
    </div>
  );
}

const navStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "18px 24px", maxWidth: 1100, margin: "0 auto", width: "100%", boxSizing: "border-box",
};
const logoMark = {
  width: 38, height: 38, borderRadius: 11,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: theme.shadow.raised,
};
const primaryButton = {
  padding: "10px 18px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer", whiteSpace: "nowrap",
};
const ghostButton = {
  padding: "10px 18px", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm,
  background: theme.colors.surface, color: theme.colors.ink, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
};
const heroStyle = {
  textAlign: "center", padding: "70px 24px 56px", maxWidth: 720, margin: "0 auto",
};
const badge = {
  display: "inline-block", padding: "6px 14px", background: theme.colors.brandSoft, color: theme.colors.brand,
  borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20,
};
const heroTitle = {
  margin: "0 0 16px", fontFamily: theme.font.display, fontWeight: 700,
  fontSize: "clamp(32px, 6vw, 46px)", lineHeight: 1.1, color: theme.colors.ink,
};
const heroSubtitle = {
  margin: "0 auto 28px", maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: theme.colors.muted,
};
const sectionTitle = {
  textAlign: "center", margin: "0 0 28px", fontFamily: theme.font.display, fontSize: 24, fontWeight: 700, color: theme.colors.ink,
};
const featuresWrap = {
  display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
  maxWidth: 960, margin: "0 auto", padding: "0 24px 60px", width: "100%", boxSizing: "border-box",
};
const featureCard = {
  flex: "1 1 260px", padding: 24, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg, boxShadow: theme.shadow.card,
};
const featureIcon = {
  width: 44, height: 44, borderRadius: 12, background: theme.colors.brandSoft,
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14,
};
const featureTitle = { margin: "0 0 6px", fontFamily: theme.font.display, fontSize: 17, fontWeight: 600, color: theme.colors.ink };
const featureText = { margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.colors.muted };
const stepsWrap = {
  background: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`,
  borderBottom: `1px solid ${theme.colors.border}`, padding: "56px 24px",
};
const stepsRow = {
  display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 960, margin: "0 auto",
};
const stepCard = { flex: "1 1 240px", textAlign: "center" };
const stepNum = {
  width: 44, height: 44, borderRadius: "50%", background: theme.colors.brand, color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
  fontFamily: theme.font.display, margin: "0 auto 14px",
};
const ctaBand = {
  background: theme.colors.sidebar, textAlign: "center", padding: "60px 24px",
  display: "flex", flexDirection: "column", alignItems: "center",
};
const ctaButton = {
  padding: "14px 28px", border: "none", borderRadius: theme.radius.sm, background: theme.colors.brand,
  color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: theme.font.body, cursor: "pointer",
};
const footerStyle = {
  textAlign: "center", padding: "24px", fontSize: 13, color: theme.colors.muted,
  borderTop: `1px solid ${theme.colors.border}`,
};

export default LandingPage;