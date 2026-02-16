// Scene.jsx (add these imports at the top)
import * as THREE from "three";
import { useMemo, useEffect, useRef } from "react";
import { ContactShadows, useTexture, OrbitControls, Sky, Environment } from "@react-three/drei";
import { useControls } from "leva";
// ...your other imports

// Add this helper component in the same file
export default function SunsetEnvironment() {
  // A slightly low sun for long, warm shadows
  // const sunPos = useMemo(() => new THREE.Vector3(5, 8, -4), []);
  // const lightRef = useRef();

  // const { px, py, pz, rx, ry, rz, intensity } = useControls("Reflector", {
  //   px: { value: -3.19, min: -5, max: 5, step: 0.0001 },
  //   py: { value: 4.47, min: -5, max: 5, step: 0.0001 },
  //   pz: { value: 2.75, min: -5, max: 5, step: 0.0001 },
  //   rx: { value: -1.47, min: -Math.PI, max: Math.PI, step: 0.0001 },
  //   ry: { value: -1.45, min: -Math.PI, max: Math.PI, step: 0.0001 },
  //   rz: { value: 0.10, min: -Math.PI, max: Math.PI, step: 0.0001 },
  //   intensity: { value: 10, min: -Math.PI, max: 100, step: 0.0001 },
  // });

  return (
    <>
      {/* Background & atmospheric falloff */}
      <fog attach="fog" args={["#fbd3a1", 10, 60]} />

      {/* Physical sky — warm, hazy sunset */}
      {/* <Sky
        distance={450000}
        sunPosition={sunPos.toArray()}
        turbidity={10}
        rayleigh={2.5}
        mieCoefficient={0.008}
        mieDirectionalG={0.95}
        inclination={0.52} // optional: slight tilt for variety
        azimuth={0.25}
      /> */}
      {/* <Environment environmentIntensity={.1} files="/hdri/background_hdri.hdr" ground={{ height: 20, radius: 100, scale: 20 }}/> */}

      {/* Key light (the sun) — warm & shadow-casting */}
      <group position={[4.24, 4.33, -0.50]} rotation={[-1.47, -0.57, 0.10]}>
            <spotLight
                width={5}
                height={8}
                intensity={100}
                color={"#ffae00"}
                castShadow
            />
            {/* <mesh>
                <planeGeometry args={[5, 8]} />
                <meshBasicMaterial color="#9fd0ff" wireframe opacity={0.3} transparent />
            </mesh> */}
      </group>

      {/* Fill light — soft, cool to balance the warmth */}
      <hemisphereLight
        skyColor={"#94c6ff"}
        groundColor={"#f6b784"}
        intensity={1}
      />

      {/* Very subtle cool rim from the opposite side to separate silhouettes */}
        {/* <group position={[px, py, pz]} rotation={[rx, ry, rz]}> */}
        <group position={[-0.4, 2., -0.4]} rotation={[-0.04, 3.11, -0.03]}>
            <rectAreaLight
                width={2}
                height={1}
                intensity={1}
                color={"#9fd0ff"}
                castShadow
            />
            {/* <mesh>
                <planeGeometry args={[2, 1]} />
                <meshBasicMaterial color="#9fd0ff" wireframe opacity={0.3} transparent />
            </mesh> */}
        </group>
    </>
  );
}
