import { useNavigate } from "react-router-dom";

export default function Project3() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2>Project Three</h2>
      <p>Detailed description of Project Three.</p>

      <button onClick={() => navigate("/portfolio")}>
        Back to Portfolio
      </button>
    </div>
  );
}
