import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef } from "react";

/**
 * CameraHUD
 * - Shows camera position, rotation (ZYX), and FOV (or "N/A" for Ortho).
 * - Renders as an HTML overlay inside the Canvas (crisp, no input blocking).
 *
 * Props:
 *   order?: "ZYX" | "XYZ" | etc.  (default "ZYX")
 *   decimals?: number              (default 2)
 *   style?: React.CSSProperties    (merge with default overlay style)
 */
export default function CameraHUD() {
  const { camera } = useThree();
  const ref = useRef(null);
  const euler = new THREE.Euler();

  const rad2deg = (r) => THREE.MathUtils.radToDeg(r);
  const normDeg = (d) => ((d + 180) % 360 + 360) % 360 - 180;

  useFrame(() => {
    // Rotation in ZYX order
    euler.setFromQuaternion(camera.quaternion, "ZYX");
    const rz = normDeg(rad2deg(euler.z));
    const ry = normDeg(rad2deg(euler.y));
    const rx = normDeg(rad2deg(euler.x));

    const { x, y, z } = camera.position;
    const fov = camera.isPerspectiveCamera ? camera.fov : null;

    if (ref.current) {
      ref.current.textContent =
        `pos: x ${x.toFixed(2)} | y ${y.toFixed(2)} | z ${z.toFixed(2)}\n` +
        `rot(ZYX): z ${rz.toFixed(2)}° | y ${ry.toFixed(2)}° | x ${rx.toFixed(2)}°\n` +
        `fov: ${fov !== null ? fov.toFixed(2) + "°" : "N/A (orthographic)"}`;
    }
  });

  return (
    <Html transform={false}
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        pointerEvents: "none",
        background: "rgba(0,0,0,0.55)",
        color: "white",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.3,
        padding: "8px 10px",
        borderRadius: 8,
        whiteSpace: "pre",
        userSelect: "none",
      }}>
      <div ref={ref} />
    </Html>
  );
}