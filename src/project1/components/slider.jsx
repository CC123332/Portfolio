export function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "120px 1fr 70px", gap: 10, alignItems: "center" }}>
      <div style={{ fontSize: 13, color: "#111827" }}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12 }}>
        {value.toFixed(2)}
      </div>
    </label>
  );
}