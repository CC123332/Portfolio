// HoverableModel.jsx
import { useGLTF, Outlines } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

export default function Model({ onSelect, resolveMaterial, ...props }) {
  const { nodes, scene } = useGLTF("/models/room.glb");

  const [hovered, setHovered] = useState(null);

  // clone meshes with baked world transforms
  const clones = useMemo(() => {
    scene.updateMatrixWorld(true);
    const arr = [];
    scene.traverse((o) => {
      if (!o.isMesh) return;
      const mesh = o.clone(false);
      mesh.matrixAutoUpdate = false;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrix.copy(o.matrixWorld);

      const sourceId = (o.name && o.name.trim()) || o.userData?.sourceId || o.uuid;
      mesh.name = o.name;
      mesh.userData = { ...o.userData, sourceId, originalMaterial: o.material };

      const g = mesh.geometry;
      if (g) {
        if (!g.getAttribute("uv2") && g.getAttribute("uv")) g.setAttribute("uv2", g.getAttribute("uv"));
        if (!g.boundingBox) g.computeBoundingBox();
      }
      arr.push(mesh);
    });
    return arr;
  }, [scene]);

  useEffect(() => {
    clones.forEach((m) => {
      const id = m.userData?.sourceId ?? m.uuid;
      const overrideMat = resolveMaterial?.(id);
      m.material = overrideMat || m.userData.originalMaterial;
      if (m.material) m.material.needsUpdate = true;
    });
  }, [clones, resolveMaterial]);

  return (
    <group {...props} dispose={null}>
      {clones.map((m) => (
        <primitive
          key={m.uuid}
          object={m}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (hovered !== m.uuid) setHovered(m.uuid);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (hovered === m.uuid) setHovered(null);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            const id = m.userData?.sourceId ?? m.uuid;
            onSelect?.(id);
          }}
        >
          <Outlines visible={hovered === m.uuid} thickness={3} />
        </primitive>
      ))}
    </group>
  );
}
