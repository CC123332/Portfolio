import { fmtVec3, fmtMat4 } from "../mathFunction";
import { codeStyle, hudPreStyle } from "../styles";
import * as THREE from "three";

export const Step5 = {
  id: 5,
  title: "Step 5 — Triplanar world dot mapping: dotMaskTriplanarWorld",
  text: (
    <>
      <p>
        Now we apply Step 4's dot function on <b>three planes</b> (XY, XZ, YZ) and blend them using the surface normal.
        This avoids obvious stretching that you'd get from projecting onto just one plane.
      </p>

      <pre style={codeStyle}>
        {`// 1) Build 2D coords from worldPos for each plane
        pXY = worldPos.xy / spacingWorld
        pXZ = worldPos.xz / spacingWorld
        pYZ = worldPos.yz / spacingWorld

        // 2) Compute mask on each plane (Step 4)
        mXY = DotMask(pXY, ...)
        mXZ = DotMask(pXZ, ...)
        mYZ = DotMask(pYZ, ...)

        // 3) Normal-based weights (which plane best matches the surface?)
        w = abs(normalize(nView))
        w = w / (w.x + w.y + w.z)

        // 4) Blend (YZ dominates when normal points X, etc.)
        dotAlpha = mYZ*w.x + mXZ*w.y + mXY*w.z`}
      </pre>

      <p>
        The result is a <b>world-projected</b> dot field: dots are anchored in world coordinates via{" "}
        <code>vWorldPos</code>. Moving/rotating the cube changes which part of the world-dot-field the cube samples.
      </p>
    </>
  ),
};

export function Step5HUD({ live }) {
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
          <div style={{ fontWeight: 700, marginBottom: 6 }}>M (local → world)</div>
          <pre style={hudPreStyle}>{fmtMat4(live.M)}</pre>
        </div>
      )}

      <div style={{ marginTop: 10, opacity: 0.85 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Step 5 focus</div>
        <div>
          We’re blending <b>three</b> Step-4 masks (XY/XZ/YZ) using the normal, so dots look consistent around edges.
        </div>
      </div>
    </>
  );
}

export function Step5Legend() {
  return (
    <>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>What you’re seeing (by step)</div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 1:</b> White dot = local point (mesh space)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 2:</b> Yellow dot = world point (Matrix4)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 3:</b> Mint dot = recovered p_local (inverse Matrix4)
      </div>
      <div style={{ marginBottom: 4 }}>
        <b>Step 4:</b> Understand one-plane dot mask (pixel-round)
      </div>
      <div>
        <b>Step 5:</b> Cyan hologram dots = triplanar world projection + normal-weight blending
      </div>
    </>
  );
}

// ---- Hologram material (Step 5 uses dotMaskTriplanarWorld) ----
export function makeHologramMaterial() {
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

    // Vertex: declare world pos varying
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `
      #include <common>
      varying vec3 vWorldPos;
      `
    );

    // Vertex: compute world pos in stable place
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
      // --- injected world position ---
      vec4 wPos = vec4( transformed, 1.0 );

      #ifdef USE_INSTANCING
        wPos = instanceMatrix * wPos;
      #endif

      wPos = modelMatrix * wPos;
      vWorldPos = wPos.xyz;
      // --- end injected world position ---

      #include <project_vertex>
      `
    );

    // Fragment: dot utilities
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `
      #include <common>
      varying vec3 vWorldPos;

        // Step 4: one-plane dot mask (centers in p-space, radius in pixels)
        float dotMask_CenterInCell_RoundInPixels(
            vec2 p,
            float period,
            float radiusPx
        ) {
        // identify grid cell
        vec2 cellId = floor(p / period);

        // local coords centered at cell center
        vec2 local = (fract(p / period) - 0.5) * period;

        // dot is EXACTLY at center
        vec2 dpSpace = local;

        // convert p-space → pixel space using Jacobian
        vec2 dpdx = dFdx(p);
        vec2 dpdy = dFdy(p);

        float det = dpdx.x * dpdy.y - dpdx.y * dpdy.x;
        if (abs(det) < 1e-10) return 0.0;

        vec2 dPix;
        dPix.x = ( dpSpace.x * dpdy.y - dpSpace.y * dpdy.x) / det;
        dPix.y = (-dpSpace.x * dpdx.y + dpSpace.y * dpdx.x) / det;

        float dPx = length(dPix);
        float aa  = fwidth(dPx);

        return 1.0 - step(radiusPx, dPx);
        }

      // Step 5: triplanar world projection + normal weights
      float dotMaskTriplanarWorld(vec3 worldPos, vec3 nView, float spacingWorld, float radiusPx, float seed)
      {
        float invSpacing = 1.0 / max(spacingWorld, 1e-6);

        vec2 pXY = worldPos.xy * invSpacing;
        vec2 pXZ = worldPos.xz * invSpacing;
        vec2 pYZ = worldPos.yz * invSpacing;

        vec3 w = abs(normalize(nView));
        w = max(w, vec3(1e-4));
        w /= (w.x + w.y + w.z);

        float period = 2.0;

        float mXY = dotMask_CenterInCell_RoundInPixels(pXY, period, radiusPx);
        float mXZ = dotMask_CenterInCell_RoundInPixels(pXZ, period, radiusPx);
        float mYZ = dotMask_CenterInCell_RoundInPixels(pYZ, period, radiusPx);

        // plane mapping:
        // XY best when normal points Z  (w.z)
        // XZ best when normal points Y  (w.y)
        // YZ best when normal points X  (w.x)
        return mYZ * w.x + mXZ * w.y + mXY * w.z;
      }
      `
    );

    // Final output
    shader.fragmentShader = shader.fragmentShader.replace(
      /}\s*$/,
      `
      vec3 currentRGB = ${outVar}.rgb;

      float seed = 13.37;
      float spacingWorld = 0.05;
      float radiusPx = 2.0;

      float dotAlpha = dotMaskTriplanarWorld(vWorldPos, vNormal, spacingWorld, radiusPx, seed);

      ${outVar}.rgb = vec3(.35, .86, .96);
      ${outVar}.a   = dotAlpha * 10.;
    }
      `
    );

    mat.userData.shader = shader;
  };

  mat.needsUpdate = true;
  return mat;
}
