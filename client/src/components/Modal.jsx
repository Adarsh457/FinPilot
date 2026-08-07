import { theme } from "../theme";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.colors.ink }}>
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" style={closeButton}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(15,21,36,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 20, zIndex: 1000, animation: "fpFadeIn 0.2s ease",
};
const boxStyle = {
  width: "100%", maxWidth: 440, background: theme.colors.surface,
  borderRadius: theme.radius.lg, boxShadow: theme.shadow.lg, padding: 24,
  maxHeight: "90vh", overflowY: "auto",
};
const closeButton = {
  border: "none", background: theme.colors.bg, cursor: "pointer",
  width: 32, height: 32, borderRadius: 8, fontSize: 15, color: theme.colors.muted,
};

export default Modal;