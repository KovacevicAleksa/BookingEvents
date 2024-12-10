import React from "react";
import QRCode from "react-qr-code"; // Library to generate QR code

function TicketItem({ ticket, onDelete }) {
  // Handle ticket deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8081/tickets/${ticket._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        onDelete(ticket._id); // Update the list after deletion
        alert("Ticket deleted successfully");
      } else {
        throw new Error("Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("Failed to delete ticket");
    }
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-xl font-bold">{ticket.eventTitle}</h3>
      <p className="text-gray-300">{ticket.eventDescription}</p>

      {/* QR Code */}
      <div className="mt-4 flex justify-center">
        <QRCode value={ticket.qrCodeData} /> {/* Display the QR code */}
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
      >
        Delete Ticket
      </button>
    </div>
  );
}

export default TicketItem;
