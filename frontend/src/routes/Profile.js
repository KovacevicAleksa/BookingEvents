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
  const [qrCode, setQrCode] = useState(null);
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
            setEvents(data.events || []);  // Events should be an array of event IDs
            setIsAdmin(data.isAdmin || false);
            setCreatedAt(data.createdAt || "");
            setUpdatedAt(data.updatedAt || "");
            generateQrCode(email); // Pass the email to generate the QR code

            // Fetch event details using the event IDs
            fetchEventDetails(data.events || []);
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

  const fetchEventDetails = (eventIds) => {
    const eventPromises = eventIds.map((eventId) => 
      fetch(`${config.api.baseURL}/view/events/${eventId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .catch(err => {
          console.error("Error fetching event data:", err);
          return null;
        })
    );

    // After all events are fetched, set the event names
    Promise.all(eventPromises)
      .then((eventsData) => {
        setEvents(eventsData.filter(event => event));  // Filter out null events in case of errors
      })
      .catch((err) => {
        setError("Error fetching events.");
      });
  };

  const generateQrCode = async (email) => {
    try {
      setError("");
      const response = await fetch(`${config.api.baseURL}${config.api.endpoints.qrcodeGenerator}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: email }), // Using userEmail for QR Code generation
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR Code");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setQrCode(null);
    }
  };

  const handleChangePassword = () => {
    navigate("/forgot-password");
  };

  return (
    <>
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr", // Default to single column
          gap: "20px",
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        {/* QR Code Card */}
        <div
          style={{
            backgroundColor: "#1f1f1f",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h3>QR Code</h3>
          {qrCode ? (
            <img 
              src={qrCode} 
              alt="Generated QR Code" 
              style={{ 
                maxWidth: "200px", 
                maxHeight: "200px", 
                width: "100%", 
                height: "auto" 
              }} 
            />
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <p>Loading QR Code...</p>
          )}
        </div>
    
        {/* User Information Card */}
        <div
          style={{
            backgroundColor: "#1f1f1f",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <img
            src="https://w7.pngwing.com/pngs/177/551/png-transparent-user-interface-design-computer-icons-default-stephen-salazar-graphy-user-interface-design-computer-wallpaper-sphere-thumbnail.png"
            alt="User Profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              marginBottom: "20px",
              objectFit: "cover",
            }}
          />
          <h2 style={{ marginBottom: "10px" }}>User Profile</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p style={{ color: "#ccc", margin: "10px 0" }}>{userEmail}</p>
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
    
        {/* Events List Card */}
        <div
          style={{
            backgroundColor: "#1f1f1f",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            height: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Registered Events</h3>
          {events.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#ccc" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Title</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Date</th>
                <th style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{event.title}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(event.date) < new Date()
                      ? "expired"
                      : new Date(event.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px" }}>{event.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No events available</p>
        )}
        </div>
      </div>
    </div>
    
    <style jsx="true">{`
      @media (min-width: 1024px) {
        div > div {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      
      @media (max-width: 1023px) {
        div > div {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
    </>
      );
    }
    
    export default Profile;