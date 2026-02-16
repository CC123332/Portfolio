import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, GizmoHelper, GizmoViewport } from "@react-three/drei";

import { checkLabel, legendStyle, buttonStyle } from "./styles";
import { clamp, fmtVec3 } from "./mathFunction";
import { Vec3Controls } from "./components/vec3Controls";

import { Step1, Step1HUD, Step1Legend } from "./steps/Step1";
import { Step2, Step2HUD, Step2Legend } from "./steps/Step2";
import { Step3, Step3HUD, Step3Legend } from "./steps/Step3";
import { Step4, Step4HUD, Step4Legend, makeHologramStep4Material } from "./steps/Step4";
import { Step5, Step5HUD, Step5Legend, makeHologramMaterial } from "./steps/Step5";

const STEPS = [Step1, Step2, Step3, Step4, Step5];

function getStepModules(step) {
  switch (step) {
    case 1:
      return { HUD: Step1HUD, Legend: Step1Legend };
    case 2:
      return { HUD: Step2HUD, Legend: Step2Legend };
    case 3:
      return { HUD: Step3HUD, Legend: Step3Legend };
    case 4:
      return { HUD: Step4HUD, Legend: Step4Legend };
    default:
      return { HUD: Step5HUD, Legend: Step5Legend };
  }
}

function Scene({ step, t, rDeg, s, localPoint, showGizmo, onLiveValues }) {
  const meshRef = useRef();

  const { M, Minv, quat } = useMemo(() => {
    const pos = new THREE.Vector3(t.x, t.y, t.z);

    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(rDeg.x),
      THREE.MathUtils.degToRad(rDeg.y),
      THREE.MathUtils.degToRad(rDeg.z),
      "XYZ"
    );

    const quat = new THREE.Quaternion().setFromEuler(euler);
    const scale = new THREE.Vector3(s.x, s.y, s.z);

    const M = new THREE.Matrix4().compose(pos, quat, scale);
    const Minv = M.clone().invert();

    return { M, Minv, quat };
  }, [t, rDeg, s]);

  const pLocal = useMemo(
    () => new THREE.Vector3(localPoint.x, localPoint.y, localPoint.z),
    [localPoint]
  );

  const pWorld = useMemo(() => pLocal.clone().applyMatrix4(M), [pLocal, M]);
  const pLocalRecovered = useMemo(() => pWorld.clone().applyMatrix4(Minv), [pWorld, Minv]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.matrixAutoUpdate = false;
    meshRef.current.matrix.copy(M);
    meshRef.current.matrixWorld.copy(M);
  }, [M]);

  useEffect(() => {
    if (!onLiveValues) return;
    onLiveValues({
      pLocal: pLocal.clone(),
      pWorld: pWorld.clone(),
      pLocalRecovered: pLocalRecovered.clone(),
      M: M.clone(),
      Minv: Minv.clone(),
      t: { ...t },
      rDeg: { ...rDeg },
      s: { ...s },
      quat: quat.clone(),
    });
  }, [pLocal, pWorld, pLocalRecovered, M, Minv, t, rDeg, s, quat, onLiveValues]);

  const showLocalPoint = step >= 1 && step <= 3;
  const showWorldPoint = step >= 2 && step <= 3;
  const showRecoveredLocalPoint = step >= 3 && step <= 3;

  // Step 4: switch cube material to hologram
  const useStep4 = step === 4;
  const useStep5 = step >= 5;

  const step4Mat = useMemo(
    () => makeHologramStep4Material({ plane: "XY", spacingWorld: 0.05, period: 2.0, radiusPx: 2.0, seed: 13.37 }),
    []
  );

  const step5Mat = useMemo(() => makeHologramMaterial(), []);

  useEffect(() => () => step4Mat.dispose(), [step4Mat]);
  useEffect(() => () => step5Mat.dispose(), [step5Mat]);

  const invScale = useMemo(() => {
    const safe = (x) => (Math.abs(x) < 1e-6 ? 1e-6 : x);
    return new THREE.Vector3(1 / safe(s.x), 1 / safe(s.y), 1 / safe(s.z));
  }, [s]);

  const hologramMat = useMemo(() => makeHologramMaterial(), []);
  useEffect(() => {
    return () => {
      hologramMat.dispose();
    };
  }, [hologramMat]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} />
      <OrbitControls makeDefault />

      {showGizmo && (
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={["#ff5555", "#55ff55", "#5555ff"]} labelColor="white" />
        </GizmoHelper>
      )}

      <gridHelper args={[20, 20]} />

      {/* The cube (local space) */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />

        {/* Step 1-3: normal transparent material, Step 4+: hologram material */}
        {useStep5 ? (
            <primitive object={step5Mat} attach="material" />
          ) : useStep4 ? (
            <primitive object={step4Mat} attach="material" />
          ) : (
          <meshStandardMaterial
            color="#8aa4ff"
            metalness={0.1}
            roughness={0.6}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        )}

        {/* Step 1: Local point dot */}
        {showLocalPoint && (
          <mesh position={[pLocal.x, pLocal.y, pLocal.z]} scale={[invScale.x, invScale.y, invScale.z]}>
            <sphereGeometry args={[0.075, 24, 24]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}

        {/* Step 3: Recovered local point dot */}
        {showRecoveredLocalPoint && (
          <mesh
            position={[pLocalRecovered.x, pLocalRecovered.y, pLocalRecovered.z]}
            scale={[invScale.x, invScale.y, invScale.z]}
          >
            <sphereGeometry args={[0.095, 24, 24]} />
            <meshStandardMaterial color="#7cf7c4" transparent opacity={0.5} depthWrite={false} />
          </mesh>
        )}
      </mesh>

      {/* Step 2: World point dot */}
      {showWorldPoint && (
        <mesh position={[pWorld.x, pWorld.y, pWorld.z]}>
          <sphereGeometry args={[0.115, 24, 24]} />
          <meshStandardMaterial color="#ffd27a" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      )}

      {/* Step 3+: recovered label */}
      {showRecoveredLocalPoint && (
        <Html position={[pWorld.x, pWorld.y + 0.35, pWorld.z]} center>
          <div
            style={{
              padding: "6px 8px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #e5e7eb",
              fontSize: 12,
              color: "#111827",
              whiteSpace: "nowrap",
            }}
          >
            recovered p_local ≈ {fmtVec3(pLocalRecovered)}
          </div>
        </Html>
      )}
    </>
  );
}

export default function JacobianStepByStepPage() {
  const [live, setLive] = useState(null);
  const [step, setStep] = useState(1);

  const [t, setT] = useState({ x: 0.0, y: 1.2, z: 0.0 });
  const [rDeg, setRDeg] = useState({ x: 0, y: 25, z: 0 });

  const s = useMemo(() => ({ x: 1.2, y: 0.8, z: 1.6 }), []);

  const [localPoint, setLocalPoint] = useState({ x: 0.3, y: 0.2, z: -0.25 });
  const [showGizmo, setShowGizmo] = useState(true);

  const stepInfo = STEPS[step - 1];
  const { HUD, Legend } = getStepModules(step);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "460px 1fr", height: "100vh" }}>
      {/* Left */}
      <div style={{ padding: 18, overflow: "auto", background: "#f9fafb", borderRight: "1px solid #e5e7eb" }}>
        <h2 style={{ margin: "0 0 8px", color: "#111827" }}>Local ↔ World Position Transform (Step-by-step)</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button
            onClick={() => setStep((s0) => Math.max(1, s0 - 1))}
            disabled={step === 1}
            style={buttonStyle(step === 1)}
          >
            Back
          </button>

          <button
            onClick={() => setStep((s0) => Math.min(STEPS.length, s0 + 1))}
            disabled={step === STEPS.length}
            style={buttonStyle(step === STEPS.length)}
          >
            Next
          </button>

          <div style={{ marginLeft: "auto", fontSize: 12, color: "#374151" }}>
            Step <b>{step}</b> / {STEPS.length}
          </div>
        </div>

        <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "#111827", marginBottom: 8 }}>{stepInfo.title}</div>
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.55 }}>{stepInfo.text}</div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={checkLabel}>
              <input type="checkbox" checked={showGizmo} onChange={(e) => setShowGizmo(e.target.checked)} />
              Show axis gizmo
            </label>
          </div>

          <Vec3Controls title="Mesh Translation (world)" v={t} min={-3} max={3} step={0.01} onChange={setT} />
          <Vec3Controls title="Mesh Rotation (degrees)" v={rDeg} min={-180} max={180} step={1} onChange={setRDeg} />

          <Vec3Controls
            title="Local Point p_local"
            v={localPoint}
            min={-1}
            max={1}
            step={0.01}
            onChange={(v) =>
              setLocalPoint({
                x: clamp(v.x, -0.95, 0.95),
                y: clamp(v.y, -0.95, 0.95),
                z: clamp(v.z, -0.95, 0.95),
              })
            }
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ position: "relative" }}>
        <Canvas camera={{ position: [6, 4, 7], fov: 50 }}>
          <Scene
            step={step}
            t={t}
            rDeg={rDeg}
            s={s}
            localPoint={localPoint}
            showGizmo={showGizmo}
            onLiveValues={setLive}
          />
        </Canvas>

        {/* HUD */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 320,
            maxHeight: 600,
            overflowY: "auto",
            padding: 12,
            borderRadius: 10,
            background: "rgba(10, 12, 18, 0.9)",
            color: "white",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Live values</div>
          {!live ? <div>Waiting for scene…</div> : <HUD live={live} />}
        </div>

        {/* Legend */}
        <div style={legendStyle}>
          <Legend />
        </div>
      </div>
    </div>
  );
}
