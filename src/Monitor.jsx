import { useRef } from "react";
import { Html, useGLTF } from '@react-three/drei'
import HeroPage from './HeroPage'
import Annotation from './Annotation'
import { useNavigate } from "react-router-dom";

export default function Monitor(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF("/models/monitor.glb");
  const navigate = useNavigate();

  return (
    <group ref={group} {...props} dispose={null}>
      <group>
        <Annotation 
            position={[
                nodes.screen.position.x + 1,
                nodes.screen.position.y + 0.6,
                nodes.screen.position.z + 0.4,
            ]}
            onClickFunction={() => navigate("/portfolio")}
        >
            Portfolio <span style={{ fontSize: '1.5em' }}>🖌️</span>
        </Annotation>
        <group>
            <mesh
                {...nodes.monitor}
                geometry={nodes.monitor.geometry}
                material={nodes.monitor.material ?? materials?.monitor}
            />
            <mesh
                {...nodes.screen}
                geometry={nodes.screen.geometry}
            >
                <Html className="content" rotation-x={Math.PI / 2} rotation-z={-Math.PI * 1.5} transform occlude="blending" position={[0.05, -5.5, 0]}>
                    <div className="wrapper" onPointerDown={(e) => e.stopPropagation()}>
                        <HeroPage />
                    </div>
                </Html>
            </mesh>
        </group>
      </group>
    </group>
  );
}
