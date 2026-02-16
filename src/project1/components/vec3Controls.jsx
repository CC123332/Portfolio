import { Slider } from "./slider";

export function Vec3Controls({ title, v, min, max, step, onChange }) {
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 10, color: "#111827" }}>{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        <Slider label="X" value={v.x} min={min} max={max} step={step} onChange={(x) => onChange({ ...v, x })} />
        <Slider label="Y" value={v.y} min={min} max={max} step={step} onChange={(y) => onChange({ ...v, y })} />
        <Slider label="Z" value={v.z} min={min} max={max} step={step} onChange={(z) => onChange({ ...v, z })} />
      </div>
    </div>
  );
}
