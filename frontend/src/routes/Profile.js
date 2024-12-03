import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config/config";

function Profile() {
  const [userEmail, setUserEmail] = useState("");
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("accountid");

    if (email && userId) {
      setUserEmail(email);
      // Fetch user details from the backend using the fetch API
      fetch(`${config.api.baseURL}/accounts/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`, // Assuming token is saved
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data) {
            setEvents(data.events || []);
            setIsAdmin(data.isAdmin || false);
            setCreatedAt(data.createdAt || "");
            setUpdatedAt(data.updatedAt || "");
          } else {
            setError("Account data is incomplete.");
          }
        })
        .catch((err) => {
          setError("Error fetching account details.");
        });
    } else {
      setError("User email or ID not found in localStorage.");
    }
  }, []);

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px",
        borderRadius: "8px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: "#1f1f1f",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#333",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            width="60"
            height="60"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 2a10 10 0 00-10 10c0 1.5 1.9 3 4.5 3s4.5-1.5 4.5-3c0 1.5 1.9 3 4.5 3s4.5-1.5 4.5-3c0-5.5-4.5-10-10-10z"
            />
          </svg>
        </div>
        <h2 style={{ marginBottom: "10px" }}>User Profile</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p style={{ color: "#ccc", margin: "10px 0" }}>{userEmail}</p>
        
        <div style={{ color: "#ccc", marginBottom: "10px" }}>
          <strong>Events:</strong>
          <ul>
            {events.length > 0 ? (
              events.map((event, index) => (
                <li key={index}>{event}</li>
              ))
            ) : (
              <li>No events available</li>
            )}
          </ul>
        </div>

        <div style={{ color: "#ccc", marginBottom: "10px" }}>
          <strong>Admin Status:</strong> {isAdmin ? "Yes" : "No"}
        </div>
        
        <div style={{ color: "#ccc", marginBottom: "10px" }}>
          <strong>Account Created At:</strong> {new Date(createdAt).toLocaleString()}
        </div>

        <div style={{ color: "#ccc", marginBottom: "20px" }}>
          <strong>Last Updated At:</strong> {new Date(updatedAt).toLocaleString()}
        </div>

        <button
          onClick={handleChangePassword}
          style={{
            backgroundColor: "#007BFF",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
            width: "100%",
            fontSize: "16px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s",
          }}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

export default Profile;
