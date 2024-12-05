import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚠️ Access Denied</h1>
      <p style={styles.message}>
        You do not have permission to access this page. Please log in.
      </p>
      <button style={styles.button} onClick={goToLogin}>
        Go to Login 🚀
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#1a1a2e",
    color: "#e94560",
    fontFamily: "'Roboto', sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    maxWidth: "600px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#0f3460",
    color: "#fff",
    transition: "background-color 0.3s",
  },
};

export default Unauthorized;
