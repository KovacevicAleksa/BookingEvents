import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../config/config";

function QrCodeGenerator() {
  const [inputText, setInputText] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState("");

  const handleGenerateQrCode = async () => {
    try {
      setError("");
      const response = await fetch(`${config.api.baseURL}${config.api.endpoints.qrcodeGenerator}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
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

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>QR Code Generator</h1>
      <input
        type="text"
        placeholder="Enter text for QR Code"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ padding: "10px", width: "60%", marginBottom: "10px" }}
      />
      <br />
      <button
        onClick={handleGenerateQrCode}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Generate QR Code
      </button>
      <div style={{ marginTop: "20px" }}>
        {qrCode ? (
          <img src={qrCode} alt="Generated QR Code" style={{ marginTop: "10px" }} />
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export default QrCodeGenerator;
