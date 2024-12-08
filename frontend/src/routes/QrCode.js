import React from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

function QrCodeScanner() {
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const qrCodeData = detectedCodes[0].rawValue; // Prva vrednost QR koda
      alert(`Scanned Data: ${qrCodeData}`);
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
          onScan={handleScan} // Funkcija koja obrađuje rezultate
          onError={handleError} // Funkcija za greške
          constraints={{ facingMode: "environment" }} // Zadnja kamera
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export default QrCodeScanner;
