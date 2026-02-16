import { fmtVec3, fmtMat4, calcMatMulProcess, describeMinvBuild } from "../mathFunction";
import { codeStyle, hudPreStyle } from "../styles";

export const Step3 = {
  id: 3,
  title: "Step 3 — World point → Local point (inverse Matrix4)",
  text: (
    <>
      <p>To go back, you use the <b>inverse</b> transform (undoing scale/rotation/translation):</p>
      <pre style={codeStyle}>
{`p_local = M^{-1} * p_world
// three.js:
const inv = mesh.matrixWorld.clone().invert();
pLocal = pWorld.applyMatrix4(inv);`}
      </pre>
      <p>The recovered local point should match the original (within tiny floating-point error).</p>
    </>
  ),
};

export function Step3HUD({ live }) {
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        p_local = <b>{fmtVec3(live.pLocal)}</b>
      </div>
      <div style={{ marginBottom: 6 }}>
        p_world = <b>{fmtVec3(live.pWorld)}</b>
      </div>

      {live.Minv && (
        <div style={{ marginTop: 10, opacity: 0.95 }}>
          <div style={{ fontWeight: 700, margin: "10px 0 6px" }}>How Minv is calculated</div>
          <pre style={hudPreStyle}>
            {describeMinvBuild({
              t: live.t,
              s: live.s,
              quat: live.quat,
              Minv: live.Minv,
            })}
          </pre>

          <div style={{ fontWeight: 700, marginBottom: 6 }}>How Step 3 computes p_local</div>
          <pre style={hudPreStyle}>
{`p_local_h = Minv * p_world_h

Minv =
${fmtMat4(live.Minv)}

${calcMatMulProcess(live.Minv, live.pWorld)}`}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 8, opacity: 0.9 }}>
        recovered p_local = <b>{fmtVec3(live.pLocalRecovered)}</b>
      </div>
    </>
  );
}

export function Step3Legend() {
  return (
    <>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>What you’re seeing (by step)</div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 1:</b> White dot = local point (mesh space)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 2:</b> Yellow dot = world point (Matrix4)
      </div>
      <div>
        <b>Step 3:</b> Mint dot = recovered p_local (inverse Matrix4)
      </div>
    </>
  );
}
