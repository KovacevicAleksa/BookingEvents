import React, { useState, useEffect } from "react";
import config from "../config/config";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [qrCode, setQrCode] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [error, setError] = useState("");
  const [qrNumber, setQrNumber] = useState(0);
  const [cachedEventDetails, setCachedEventDetails] = useState({});
  const [cachedQrCodes, setCachedQrCodes] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem("accountid");
    if (userId) {
      fetchTickets(userId);
    } else {
      setError("User not authenticated");
    }
  }, []);

  const fetchTickets = async (userId) => {
    try {
      const response = await fetch(`${config.api.baseURL}/tickets/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,

        },
        body: JSON.stringify({ assignedTo: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
        if (data.length > 0) {
          fetchEventDetails(data[0].eventID, data[0]._id);
        }
      } else {
        setError("Failed to fetch tickets");
      }
    } catch (err) {
      setError("Error fetching tickets");
    }
  };

  const fetchEventDetails = async (eventID, ticketID) => {
    // Check if event and QR code details are cached
    if (cachedEventDetails[eventID] && cachedQrCodes[ticketID]) {
      setEventTitle(cachedEventDetails[eventID]);
      setQrCode(cachedQrCodes[ticketID]);
      return;
    }

    try {
      // Fetch event details
      const eventResponse = await fetch(`${config.api.baseURL}/view/events/${eventID}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (eventResponse.ok) {
        const event = await eventResponse.json();
        const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Set event title with date formatted
        const eventTitle = `${event.title}  (${formattedDate})`;
        setEventTitle(eventTitle);
        setCachedEventDetails(prev => ({ ...prev, [eventID]: eventTitle }));
      } else {
        setError("Failed to fetch event details");
      }

      // Fetch QR code details
      const qrResponse = await fetch(`${config.api.baseURL}${config.api.endpoints.qrcodeGenerator}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: ticketID }),
      });

      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        setQrCode(qrData.qrCode);
        setQrNumber(currentTicketIndex + 1); // Set the QR number based on current ticket index
        setCachedQrCodes(prev => ({ ...prev, [ticketID]: qrData.qrCode }));
      } else {
        setError("Failed to generate QR code");
      }
    } catch (err) {
      setError("Error fetching event or QR code");
    }
  };

  // Handle next ticket navigation
  const handleNext = () => {
    const nextIndex = (currentTicketIndex + 1) % tickets.length;
    setCurrentTicketIndex(nextIndex);
    fetchEventDetails(tickets[nextIndex].eventID, tickets[nextIndex]._id);
    setQrNumber(nextIndex + 1); // Update QR number here
  };

  // Handle previous ticket navigation
  const handlePrevious = () => {
    const prevIndex = (currentTicketIndex - 1 + tickets.length) % tickets.length;
    setCurrentTicketIndex(prevIndex);
    fetchEventDetails(tickets[prevIndex].eventID, tickets[prevIndex]._id);
    setQrNumber(prevIndex + 1); // Update QR number here
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}

      {tickets.length < 1 ? (
        <p>No tickets available</p>
      ) : (
        <>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{eventTitle}</h1> {/* Make event title bigger */}
          <p style={{ fontSize: "1.2rem" }}>QR Code #{qrNumber}</p> {/* Display QR code number */}
          
          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code"
              style={{
                width: "80%",
                maxWidth: "500px",
                height: "auto",
                margin: "20px 0",
              }}
            />
          )}

          <div>
            <button
              onClick={handlePrevious}
              style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MyTickets;
