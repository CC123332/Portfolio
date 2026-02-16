import { useMemo, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Scene from "./Scene";
import PortfolioPage from "./Portfolio";
import Project1 from "./project1/Project1";
import Project2 from "./Project2";
import Project3 from "./Project3";

// PBR materials
const MATERIAL_LIBRARY = {
  "038": {
    map: "/textures/Metal-053-A/basecolor.jpg",
    normalMap: "/textures/Metal-053-A/normal.png",
    roughnessMap: "/textures/Metal-053-A/roughness.jpg",
    metalnessMap: "/textures/Metal-053-A/metallic.jpg",
    aoMap: "/textures/Metal-053-A/ao.jpg",
    defaults: { metalness: 1.0, roughness: 0.5 }
  },
  "053": {
    map: "/textures/Metal038/basecolor.jpg",
    roughnessMap: "/textures/Metal038/roughness.jpg",
    metalnessMap: "/textures/Metal038/metallic.jpg",
    normalMap: "/textures/Metal038/normal.jpg",
    aoMap: "/textures/Metal-053-A/ao.jpg",
    defaults: { metalness: 1.0, roughness: 0.5 }
  },
  "Default": {
    defaults: { metalness: 1.0, roughness: 0.15 }
  }
};

function ViewerPage({
  selectedPart,
  setSelectedPart,
  materialNames,
  applyMaterialToSelected,
  overrides,
}) {

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Floating Panel */}
      {selectedPart && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,              // <-- key
            pointerEvents: "auto",   // <-- keep UI clickable
            padding: 16,
            background: "rgba(0,0,0,0.6)",
            color: "white",
            borderRadius: 12,
            fontSize: 14,
            minWidth: 260,
            backdropFilter: "blur(4px)",
          }}
        >
          <h3 style={{ margin: "0 0 10px" }}>Select Materials</h3>
          <div style={{ display: "flex" }}>
            {materialNames.map((name) => (
              <div
                className="circular-container"
                key={name}
                onClick={() => applyMaterialToSelected(name)}
              >
                <div
                  className="circular-background"
                  style={{ backgroundImage: `url('/textures/${name}.png')` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Canvas
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
        shadows
        camera={{ position: [0, 3.2, 4], fov: 55 }}
        className="r3f-canvas cursor-paint"
        onPointerMissed={() => setSelectedPart(null)}
      >
        <Suspense fallback={null}>
          <Scene
            materialLibrary={MATERIAL_LIBRARY}
            overrides={overrides}
            onSelect={setSelectedPart}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function App() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [overrides, setOverrides] = useState({});

  const materialNames = useMemo(() => Object.keys(MATERIAL_LIBRARY), []);

  const applyMaterialToSelected = (matName) => {
    if (!selectedPart) return;
    setOverrides((prev) => ({ ...prev, [selectedPart]: matName }));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ViewerPage
            selectedPart={selectedPart}
            setSelectedPart={setSelectedPart}
            materialNames={materialNames}
            applyMaterialToSelected={applyMaterialToSelected}
            overrides={overrides}
          />
        }
      />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/project-1" element={<Project1 />} />
      <Route path="/portfolio/project-2" element={<Project2 />} />
      <Route path="/portfolio/project-3" element={<Project3 />} />
    </Routes>
  );
}