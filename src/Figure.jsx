import { useEffect, useState } from "react";
import { useTexture, useGLTF, useAnimations } from '@react-three/drei'

export default function Figure(props) {
  // Fetch model and a separate texture
  const texture = useTexture("/figure_texture.png")
  const { nodes, animations } = useGLTF("/models/animated_figure.glb")
  // Extract animation actions
  const { ref, actions, names } = useAnimations(animations)
  // Hover and animation-index states
  const [hovered, setHovered] = useState(false)
  const index = 0

  // Change cursor on hover-state
  useEffect(() => void (document.body.style.cursor = hovered ? "pointer" : "auto"), [hovered])

  // Change animation when the index changes
  useEffect(() => {
    actions[names[index]].reset().fadeIn(0.5).play()
    return () => {}
  }, [index, actions, names])

  return (
    <group ref={ref} {...props} dispose={null}>
      <group rotation={[Math.PI / 2, 0, Math.PI]} scale={0.004} position={[0.5, -1.1, 1.8]}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          castShadow={false}
          receiveShadow={false}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setIndex((index + 1) % names.length)}
          geometry={nodes.combined.geometry}
          skeleton={nodes.combined.skeleton}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1}>
          <meshBasicMaterial map={texture} map-flipY={false} skinning />
        </skinnedMesh>
      </group>
    </group>
  );
}
