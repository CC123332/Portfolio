import { fmtVec3 } from "../mathFunction";

export const Step1 = {
  id: 1,
  title: "Step 1 — Local coordinates exist",
  text: (
    <>
      <p>
        A mesh has its own <b>local coordinates</b>. A point like <code>(1, 0, 0)</code> means “1 unit to the right of
        the mesh&apos;s center,” regardless of where the mesh is in the scene.
      </p>
      <p>In the 3D view, the <b>white dot</b> is the local point (it is a child of the mesh).</p>
    </>
  ),
};

export function Step1HUD({ live }) {
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        p_local = <b>{fmtVec3(live.pLocal)}</b>
      </div>
    </>
  );
}

export function Step1Legend() {
  return (
    <>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>What you're seeing</div>
      <div>
        White dot = local point (mesh space)
      </div>
    </>
  );
}
