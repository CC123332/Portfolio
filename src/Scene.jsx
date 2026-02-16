// Scene.jsx
import * as THREE from "three";
import { useMemo } from "react";
import { ContactShadows, useTexture, OrbitControls } from "@react-three/drei";
import Model from "./HoverableModel";
import Monitor from "./Monitor";
import Figure from "./Figure";
import Frame from "./Frame";
import SunsetEnvironment from "./Environment";


/**
 * Build THREE materials from the library.
 * IMPORTANT: This hook runs inside the Canvas tree.
 */
function usePBRMaterials(lib) {
  const mats = {};
  

  for (const [name, def] of Object.entries(lib)) {
    // Only pass map keys that exist to useTexture
    const mapDefs = Object.fromEntries(
      Object.entries(def).filter(([k]) =>
        [
          "map",
          "normalMap",
          "roughnessMap",
          "metalnessMap",
          "aoMap",
          "displacementMap",
        ].includes(k)
      )
    );

    // Load maps (if any)
    const maps = useTexture(mapDefs);

    // Color spaces & Y flips
    // Color/albedo is sRGB; all others should remain linear (default).
    if (maps.map) maps.map.colorSpace = THREE.SRGBColorSpace;

    // GLTF-style textures are baked for flipY=false
    if (maps.normalMap) maps.normalMap.flipY = false;
    if (maps.roughnessMap) maps.roughnessMap.flipY = false;
    if (maps.metalnessMap) maps.metalnessMap.flipY = false;
    if (maps.aoMap) maps.aoMap.flipY = false;
    if (maps.displacementMap) maps.displacementMap.flipY = false;

    mats[name] = useMemo(() => {
      const material = new THREE.MeshStandardMaterial({
        map: maps.map || null,
        normalMap: maps.normalMap || null,
        roughnessMap: maps.roughnessMap || null,
        metalnessMap: maps.metalnessMap || null,
        aoMap: maps.aoMap || null,
        displacementMap: maps.displacementMap || null,

        // Scalars (use defaults when maps are absent)
        metalness: maps.metalnessMap ? 1.0 : def?.defaults?.metalness ?? 0.0,
        roughness: maps.roughnessMap ? 1.0 : def?.defaults?.roughness ?? 0.5,

        // Displacement controls
        displacementScale: def?.defaults?.displacementScale ?? 0.0, // try 0.01–0.1
        displacementBias: def?.defaults?.displacementBias ?? 0.0,
      });

      // Optional: if you tile textures
      if (def?.repeat && material.displacementMap) {
        material.displacementMap.wrapS = material.displacementMap.wrapT = THREE.RepeatWrapping;
        material.displacementMap.repeat.set(def.repeat[0], def.repeat[1]);
      }

      // Optional: tweak normal strength via defaults
      if (material.normalMap && def?.defaults?.normalScale) {
        material.normalScale = new THREE.Vector2(
          def.defaults.normalScale[0],
          def.defaults.normalScale[1]
        );
      }

      return material;
    }, [
      maps.map,
      maps.normalMap,
      maps.roughnessMap,
      maps.metalnessMap,
      maps.aoMap,
      maps.displacementMap,
      def?.defaults?.metalness,
      def?.defaults?.roughness,
      def?.defaults?.displacementScale,
      def?.defaults?.displacementBias,
      def?.defaults?.normalScale,
      def?.repeat,
    ]);
  }

  return mats;
}

export default function Scene({ materialLibrary, overrides, onSelect }) {
  const materialsByName = usePBRMaterials(materialLibrary);

  // Resolver that maps partId -> THREE.Material (or null for original)
  const resolveMaterial = useMemo(() => {
    return (partId) => {
      const matName = overrides?.[partId];
      return matName ? materialsByName[matName] : null;
    };
  }, [overrides, materialsByName]);

  return (
    <>
      <SunsetEnvironment />
      <group rotation={[0, Math.PI, 0]}>
        <Model onSelect={onSelect} resolveMaterial={resolveMaterial} />
        <Monitor />
        <Frame />
        <Figure />
      </group>

      <ContactShadows
        frames={1}
        position={[0, -0.5, 0]}
        scale={10}
        opacity={0.4}
        far={1}
        blur={2}
      />
      <OrbitControls makeDefault rotateSpeed={2} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
    </>
  );
}
