import { useNavigate } from "react-router-dom";

const projects = [
  {
    id: 1,
    title: "Animated Hologram Effect Shader",
    description: "Animated Hologram Effect using webgl and threejs.",
    image: "/images/project1.jpg",
    path: "/portfolio/project-1"
  },
  {
    id: 2,
    title: "Project Two",
    description: "description.",
    image: "/images/project2.jpg",
    path: "/portfolio/project-2"
  },
  {
    id: 3,
    title: "Project Three",
    description: "description.",
    image: "/images/project3.jpg",
    path: "/portfolio/project-3"
  }
];

export default function Portfolio() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2>Portfolio</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
          marginTop: 24
        }}
      >
        {projects.map(project => (
          <div
            key={project.id}
            onClick={() => navigate(project.path)}
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
              transition: "transform 0.15s ease, box-shadow 0.15s ease"
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(0,0,0,0.12)")
            }
            onMouseLeave={e =>
              (e.currentTarget.style.boxShadow = "none")
            }
          >
            <img
              src={project.image}
              alt={project.title}
              style={{ width: "100%", height: 160, objectFit: "cover" }}
            />

            <div style={{ padding: 16 }}>
              <h3 style={{ margin: "0 0 8px" }}>{project.title}</h3>
              <p style={{ margin: 0, color: "#555" }}>
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: 32 }}
      >
        Back
      </button>
    </div>
  );
}
