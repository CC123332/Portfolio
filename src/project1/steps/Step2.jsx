import { fmtVec3, fmtMat4, calcWorldProcess, describeMBuildJSX } from "../mathFunction";
import { codeStyle, hudPreStyle } from "../styles";

export const Step2 = {
  id: 2,
  title: "Step 2 — Local point → World point (Matrix4)",
  text: (
    <>
      <p>
        To convert a <b>position</b> from local to world, we use the mesh’s full transform, including translation:
      </p>
      <pre style={codeStyle}>
{`p_world = M * p_local
// three.js:
pWorld = pLocal.applyMatrix4(mesh.matrixWorld);`}
      </pre>
      <p>In the 3D view, the <b>yellow dot</b> is the world position of that same point.</p>
    </>
  ),
};

export function Step2HUD({ live }) {
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        p_local = <b>{fmtVec3(live.pLocal)}</b>
      </div>
      <div style={{ marginBottom: 6 }}>
        p_world = <b>{fmtVec3(live.pWorld)}</b>
      </div>

      {live.M && live.quat && (
        <div style={{ marginTop: 10, opacity: 0.95 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>How M is calculated</div>
            <pre style={hudPreStyle}>
                {describeMBuildJSX({
                    t: live.t,
                    rDeg: live.rDeg,
                    s: live.s,
                    quat: live.quat,
                    M: live.M,
                })}
            </pre>
        </div>
      )}

      {live.M && (
        <div style={{ marginTop: 10, opacity: 0.95 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>How Step 2 computes p_world</div>
          <pre style={hudPreStyle}>
{`p_world_h = M * p_local_h

M =
${fmtMat4(live.M)}

${calcWorldProcess(live.M, live.pLocal)}`}
          </pre>
        </div>
      )}
    </>
  );
}

export function Step2Legend() {
  return (
    <>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>What you’re seeing</div>
      <div style={{ marginBottom: 4 }}>
        White dot = local point (mesh space)
      </div>
      <div>
        Yellow dot = world point (Matrix4)
      </div>
    </>
  );
}
