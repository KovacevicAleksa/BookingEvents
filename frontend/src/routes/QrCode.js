import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import config from "../config/config.js";

function QrCodeScanner() {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [ticketStatus, setTicketStatus] = useState(null); // To store ticket status
  const [error, setError] = useState(null); // To store error message

  const handleScan = async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const newCodes = detectedCodes.map((code) => code.rawValue);
      setScannedCodes((prevCodes) => [...new Set([...prevCodes, ...newCodes])]);

      const ticketId = newCodes[0]; // Assuming you want to use the first scanned code

      try {
        // First API call to get ticket details
        const ticketResponse = await fetch(`${config.api.baseURL}/tickets/${ticketId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!ticketResponse.ok) {
          throw new Error("Ticket not found or invalid");
        }

        const ticketData = await ticketResponse.json();
        const assignedTo = ticketData.assignedTo;

        // Second API call to get user details based on assignedTo ID
        const userResponse = await fetch(`${config.api.baseURL}/accounts/${assignedTo}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }

        const userData = await userResponse.json();
        setTicketStatus(
          <span style={{ color: "green" }}>
            Ticket assigned to: {userData.email} ✅
          </span>
        );      } catch (error) {
        setTicketStatus(null);
        setError(error.message); // Handle errors
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>QR Code Scanner</h1>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: "environment" }}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Skenirani QR kodovi:</h2>
        <ul>
          {scannedCodes.length > 0 ? (
            scannedCodes.map((code, index) => <li key={index}>{code}</li>)
          ) : (
            <p>Nema skeniranih QR kodova.</p>
          )}
        </ul>
        {ticketStatus && <p>{ticketStatus}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default QrCodeScanner;
