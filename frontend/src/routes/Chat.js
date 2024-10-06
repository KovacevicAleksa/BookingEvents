import React, { useState, useEffect, useCallback } from "react"; // Import necessary hooks from React
import io from "socket.io-client"; // Import Socket.IO client
import { useParams } from "react-router-dom"; // Import useParams to get URL parameters

const Chat = () => {
  // Get roomName from URL parameters
  const { roomName } = useParams();
  // State to manage the socket connection
  const [socket, setSocket] = useState(null);
  // State to manage the current message input
  const [message, setMessage] = useState("");
  // State to manage the list of chat messages
  const [messages, setMessages] = useState([]);
  // State to manage the number of active users in the chat
  const [activeUsers, setActiveUsers] = useState(0);

  // Initialize the socket connection and set up event listeners
  const initializeSocket = useCallback(() => {
    // Create a new socket connection
    const newSocket = io(`http://localhost:8081`, {
      withCredentials: true,
    });
    setSocket(newSocket); // Store the socket connection in state

    // Event listener for successful connection
    newSocket.on("connect", () => {
      console.log("Connected to server");
      // Emit user email if available in localStorage
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        newSocket.emit("user email", userEmail); // Send user email to the server
      }
      // Join the specific room
      newSocket.emit("join room", roomName);
    });

    // Event listener for receiving new chat messages
    newSocket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]); // Update the message list with new messages
    });

    // Event listener for active user count
    newSocket.on("active users", (count) => {
      setActiveUsers(count); // Update the count of active users
    });

    // Event listener for receiving previous messages
    newSocket.on("previous messages", (prevMessages) => {
      console.log("Received previous messages:", prevMessages);
      setMessages(
        prevMessages.map((msg) => ({
          text: msg.message, // Map the previous messages to the expected format
          email: msg.email,
          timestamp: new Date(msg.timestamp), // Convert timestamp to a Date object
        }))
      );
    });

    // Cleanup function to remove event listeners and disconnect socket
    return () => {
      newSocket.off("connect");
      newSocket.off("chat message");
      newSocket.off("active users");
      newSocket.off("previous messages");
      newSocket.emit("leave room", roomName); // Leave the room when component unmounts
      newSocket.close(); // Close the socket connection
    };
  }, [roomName]); // Re-run this effect when roomName changes

  // Initialize the socket connection on component mount
  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup; // Return cleanup function
  }, [initializeSocket]);

  // Function to handle sending a message
  const sendMessage = (e) => {
    e.preventDefault(); // Prevent default form submission
    // Emit the message if socket and message are valid
    if (socket && message) {
      socket.emit("chat message", { room: roomName, message: message }); // Send the message to the server
      setMessage(""); // Clear the message input
    }
  };

  // Function to format timestamp into a readable time string
  const formatTime = (timestamp) => {
    const date = new Date(timestamp); // Convert timestamp to a Date object
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Format time
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {decodeURIComponent(roomName).toUpperCase()}{" "}
            {/* Display room name */}
          </h1>
          <p className="text-sm bg-indigo-500 px-3 py-1 rounded-full">
            Active Users: {activeUsers} {/* Show count of active users */}
          </p>
        </div>
      </div>

      {/* Message List */}
      <ul className="flex-grow overflow-y-auto p-4 bg-gray-200">
        {messages.map((msg, index) => (
          <li
            key={index}
            className="mb-2 p-3 border rounded-lg shadow-sm bg-white"
          >
            <div className="flex items-center mb-1">
              <strong className="text-blue-700">{msg.email}:</strong>
            </div>
            <p className="mb-1 text-gray-700">{msg.text || msg.message}</p>
            <span className="text-xs text-gray-500">
              {formatTime(msg.timestamp)}{" "}
              {/* Format and display message timestamp */}
            </span>
          </li>
        ))}
      </ul>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="container mx-auto">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)} // Update message state on input change
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..." // Placeholder for the input field
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Send {/* Button to send the message */}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; // Export the Chat component
