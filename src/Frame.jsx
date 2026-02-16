import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useGLTF } from '@react-three/drei'
import { Reflector } from "three-stdlib";
import { extend } from "@react-three/fiber";
import { useControls } from "leva";
extend({ Reflector });

export default function Frame(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF("/models/frame.glb");

  const reflectorRef = useRef();
  const planeGeom = useMemo(() => new THREE.PlaneGeometry(0.4, 0.55), []);

//   const { px, py, pz, rx, ry, rz } = useControls("Reflector", {
//     px: { value: -1.43, min: -5, max: 5, step: 0.0001 },
//     py: { value: 1.30, min: -5, max: 5, step: 0.0001 },
//     pz: { value: 0.04, min: -5, max: 5, step: 0.0001 },
//     rx: { value: -0.45, min: -Math.PI, max: Math.PI, step: 0.0001 },
//     ry: { value: 0.61, min: -Math.PI, max: Math.PI, step: 0.0001 },
//     rz: { value: 0.27, min: -Math.PI, max: Math.PI, step: 0.0001 },
//   });

  return (
        <group ref={group} {...props} dispose={null}>
        <mesh
            {...nodes.frame}
            geometry={nodes.frame.geometry}
            material={nodes.frame.material ?? materials?.frame}
        />
        <reflector
            ref={reflectorRef}
            // Reflector(geometry, options)
            args={[
            planeGeom,
            {
                textureWidth: 2048,
                textureHeight: 2048,
            },
            ]}
            // position={[px, py, pz]}
            // rotation={[rx, ry, rz]}
            position={[-1.43, 1.30, 0.04]}
            rotation={[-0.45, 0.61, 0.27]}
        />
    </group>
  );
}
