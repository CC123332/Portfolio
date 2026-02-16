import { useNavigate } from "react-router-dom";

export default function Project2() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2>Project Two</h2>
      <p>Detailed description of Project Two.</p>

      <button onClick={() => navigate("/portfolio")}>
        Back to Portfolio
      </button>
    </div>
  );
}
