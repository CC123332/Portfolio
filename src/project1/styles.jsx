export const checkLabel = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  color: "white",
};

export const legendStyle = {
  position: "absolute",
  left: 12,
  bottom: 12,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #e5e7eb",
  color: "#111827",
  fontSize: 12,
  width: 420,
};

export function buttonStyle(disabled) {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: disabled ? "#f3f4f6" : "#ffffff",
    color: disabled ? "#9ca3af" : "#111827",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
  };
}

export const codeStyle = {
  background: "#111827",
  color: "white",
  padding: 10,
  borderRadius: 10,
  overflow: "auto",
  fontSize: 12,
  lineHeight: 1.35,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const hudPreStyle = {
  margin: 0,
  padding: 10,
  borderRadius: 10,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 11,
  lineHeight: 1.35,
  whiteSpace: "pre-wrap",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};