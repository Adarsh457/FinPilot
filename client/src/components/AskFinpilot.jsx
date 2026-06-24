import { useState } from "react";
import { askAI } from "../api";
import { theme } from "../theme";

function AskFinPilot() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  async function handleAsk() {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer("");
    setError(null);
    try {
      const data = await askAI(question);
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  }

  return (
    <section style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={avatarStyle}>✦</div>
        <div>
          <div style={{ fontFamily: theme.font.display, fontSize: 16, fontWeight: 600, color: theme.colors.ink }}>
            Ask FinPilot
          </div>
          <div style={{ fontSize: 12, color: theme.colors.muted }}>AI assistant</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={inputStyle}
          placeholder="Where can I cut back this month?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button onClick={handleAsk} disabled={asking} style={{ ...askButton, opacity: asking ? 0.7 : 1 }}>
          {asking ? "…" : "Ask"}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {asking && <TypingDots />}

        {error && (
          <div style={{ ...bubbleStyle, borderLeftColor: theme.colors.expense, background: "#FDF0F0", color: theme.colors.expense }}>
            {error}
          </div>
        )}

        {!asking && !error && answer && (
          <div style={bubbleStyle} key={answer}>{answer}</div>
        )}

        {!asking && !error && !answer && (
          <p style={{ margin: 0, fontSize: 13, color: theme.colors.muted, lineHeight: 1.6 }}>
            Ask anything about your spending — try “What’s my biggest expense?” or “How can I save ₹5,000 a month?”
          </p>
        )}
      </div>
    </section>
  );
}

function TypingDots() {
  const dot = {
    width: 7, height: 7, borderRadius: "50%", background: theme.colors.brand,
    display: "inline-block", animation: "fpBlink 1.2s infinite ease-in-out",
  };
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 2px" }}>
      <span style={{ ...dot, animationDelay: "0s" }} />
      <span style={{ ...dot, animationDelay: "0.2s" }} />
      <span style={{ ...dot, animationDelay: "0.4s" }} />
      <span style={{ marginLeft: 6, fontSize: 13, color: theme.colors.muted }}>FinPilot is thinking…</span>
    </div>
  );
}

const cardStyle = {
  flex: "1 1 340px", padding: 20, background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.card, display: "flex", flexDirection: "column",
};
const avatarStyle = {
  width: 38, height: 38, borderRadius: 11,
  background: `linear-gradient(135deg, ${theme.colors.brand}, #7C6DF2)`,
  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 18, boxShadow: theme.shadow.raised,
};
const inputStyle = {
  flex: 1, padding: "10px 12px", border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm, fontSize: 14, fontFamily: theme.font.body,
  color: theme.colors.ink, background: "#fff",
};
const askButton = {
  padding: "10px 18px", border: "none", borderRadius: theme.radius.sm,
  background: theme.colors.brand, color: "#fff", fontSize: 14,
  fontWeight: 600, cursor: "pointer", minWidth: 56,
};
const bubbleStyle = {
  padding: "14px 16px", background: theme.colors.brandSoft,
  border: `1px solid ${theme.colors.border}`, borderLeft: `3px solid ${theme.colors.brand}`,
  borderRadius: theme.radius.md, fontSize: 14, lineHeight: 1.6,
  color: theme.colors.ink, whiteSpace: "pre-wrap", animation: "fpFadeIn 0.35s ease both",
};

export default AskFinPilot;