import { fmtVec3, fmtMat4 } from "../mathFunction";
import { codeStyle, hudPreStyle } from "../styles";
import * as THREE from "three";

export const Step4 = {
  id: 4,
  title: "Step 4 — Building one dot cell: DotMask_CentersInP_RoundInPixels",
  text: (
    <>
      <p>
        This step zooms into the core dot function:{" "}
        <code>DotMask_CentersInP_RoundInPixels(p, period, radiusPx, seed)</code>.
      </p>

      <p>
        It answers: “Given a 2D coordinate <code>p</code>, am I inside a dot?” The key design choice is:
      </p>

      <ul>
        <li>
          Dot <b>centers</b> live in <b>p-space</b> (tiling grid).
        </li>
        <li>
          Dot <b>radius</b> is measured in <b>screen pixels</b> (<code>radiusPx</code>), so dots stay round and
          camera-facing even under perspective / stretching.
        </li>
      </ul>

      <pre style={codeStyle}>
        {`// 1) Tile p into cells (period spacing)
        cellId = floor(p / period)
        local  = (fract(p / period) - 0.5) * period

        // 2) Delta in p-space
        dpSpace = local - center

        // 3) Convert p-space delta -> pixel delta using derivatives
        dpdx = dFdx(p)
        dpdy = dFdy(p)
        dPix = inverse([dpdx dpdy]) * dpSpace

        // 4) get mask by comparing pixel distance to radius in pixels
        mask = 1.0 - step(radiusPx, dPx)`}
      </pre>

      <p>
        The “magic” is Step (4): the inverse-Jacobian via <code>dFdx</code>/<code>dFdy</code>. That converts your
        p-space distances into <b>screen pixel distances</b>, so the dot edge works in pixel units.
      </p>
    </>
  ),
};

export function Step4HUD({ live }) {
  return (
    <>
      <div style={{ marginBottom: 6 }}>
        p_local = <b>{fmtVec3(live.pLocal)}</b>
      </div>
      <div style={{ marginBottom: 6 }}>
        p_world = <b>{fmtVec3(live.pWorld)}</b>
      </div>
      <div style={{ marginTop: 8, opacity: 0.9 }}>
        recovered p_local = <b>{fmtVec3(live.pLocalRecovered)}</b>
      </div>

      {live.M && (
        <div style={{ marginTop: 10, opacity: 0.95 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>M (still the same local → world)</div>
          <pre style={hudPreStyle}>{fmtMat4(live.M)}</pre>
        </div>
      )}

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Step 4 focus</div>
        <div>
          We're isolating the <b>single-plane</b> dot mask logic: tiling + converting p-space distances into{" "}
          <b>pixel distances</b> for a round dot.
        </div>
      </div>
    </>
  );
}

export function Step4Legend() {
  return (
    <>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>What you're seeing (by step)</div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 1:</b> White dot = local point (mesh space)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 2:</b> Yellow dot = world point (Matrix4)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 3:</b> Mint dot = recovered p_local (inverse Matrix4)
      </div>
      <div>
        <b>Step 4:</b> Learn how one dot cell is computed (p-space center, pixel-radius)
      </div>
    </>
  );
}

export function makeHologramStep4Material({
  spacingWorld = 0.1, // (kept for API) world-units per 1 "p unit"
  radiusPx = 2.0,      // dot radius in screen pixels (always round)
  color = new THREE.Color(0.35, 0.86, 0.96),
} = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
    transparent: true,
    depthWrite: false,
  });

  mat.onBeforeCompile = (shader) => {
    const usesPCFragColor = shader.fragmentShader.includes("pc_fragColor");
    const outVar = usesPCFragColor ? "pc_fragColor" : "gl_FragColor";
    const isGLSL3 = shader.glslVersion === THREE.GLSL3;

    // ---- Vertex: pass world position ----
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      ${isGLSL3 ? "out vec3 vWorldPos;" : "varying vec3 vWorldPos;"}
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
      // compute world pos from transformed (safe + explicit)
      vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      #include <project_vertex>
      `
    );

    // ---- Fragment: world-space cells + round-in-pixels dots ----
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `
      #include <common>
      ${isGLSL3 ? "in vec3 vWorldPos;" : "varying vec3 vWorldPos;"}

      // World-space cell tiling; radius measured in screen pixels (round + camera-facing)
      // worldDelta → pixelDelta via inverse Jacobian from dFdx/dFdy(world)
      float dotMask_WorldCell_RoundInPixels(
        vec2 w,              // world-space coordinate (e.g., vWorldPos.xy)
        float cellSizeWorld, // world units per cell
        float radiusPx
      ) {
        // Local offset inside the cell, centered at (0,0)
        vec2 local = (fract(w / cellSizeWorld) - 0.5) * cellSizeWorld;

        // Jacobian columns: how world coord changes per screen pixel
        vec2 dwdx = dFdx(w);
        vec2 dwdy = dFdy(w);

        float det = dwdx.x * dwdy.y - dwdx.y * dwdy.x;
        if (abs(det) < 1e-10) return 0.0;

        // pixelDelta = inverse(J) * local
        vec2 dPix;
        dPix.x = ( local.x * dwdy.y - local.y * dwdy.x) / det;
        dPix.y = (-local.x * dwdx.y + local.y * dwdx.x) / det;

        float dPx = length(dPix);

        // hard edge
        return 1.0 - step(radiusPx, dPx);
      }
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      /}\s*$/,
      `
      // ---- Step 4: Single-plane world projection (XY), world-space cells ----
      float mask = dotMask_WorldCell_RoundInPixels(
        vWorldPos.xy,
        ${spacingWorld.toFixed(8)},
        ${radiusPx.toFixed(8)}
      );

      ${outVar}.rgb = vec3(${color.r}, ${color.g}, ${color.b});
      ${outVar}.a   = clamp(mask, 0.0, 1.0);
    }
      `
    );

    mat.userData.shader = shader;
  };

  mat.needsUpdate = true;
  return mat;
}
