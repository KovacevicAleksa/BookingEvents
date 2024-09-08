import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const Chat = () => {
  // Get roomName from URL parameters
  const { roomName } = useParams();
  // State to manage the socket connection
  const [socket, setSocket] = useState(null);
  // State to manage the current message input
  const [message, setMessage] = useState("");
  // State to manage the list of chat messages
  const [messages, setMessages] = useState([]);

  // Function to initialize the socket connection
  const initializeSocket = useCallback(() => {
    // Create a new socket connection
    const newSocket = io("http://localhost:8081", {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Event listener for successful connection
    newSocket.on("connect", () => {
      console.log("Connected to server");
      // Emit user email if available in localStorage
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        newSocket.emit("user email", userEmail);
      }
      // Join the specific room
      newSocket.emit("join room", roomName);
    });

    // Event listener for receiving new chat messages
    newSocket.on("chat message", (msg) => {
      // Update state with the new message
      setMessages((prev) => [...prev, { text: msg.text, sender: msg.email }]);
    });

    // Cleanup function to be called on component unmount
    return () => {
      newSocket.off("connect");
      newSocket.off("chat message");
      newSocket.emit("leave room", roomName);
      newSocket.close();
    };
  }, [roomName]);

  // Initialize the socket connection on component mount
  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

  // Function to handle sending a message
  const sendMessage = (e) => {
    e.preventDefault();
    // Emit the message if socket and message are valid
    if (socket && message) {
      socket.emit("chat message", { room: roomName, message: message });
      setMessage("");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Display room name in uppercase centered at the top */}
      <p className="text-center text-3xl font-bold py-4 bg-gray-800 text-white">
        {decodeURIComponent(roomName).toUpperCase()}
      </p>
      {/* Display the list of messages */}
      <ul className="flex-grow overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg, index) => (
          <li key={index} className="mb-2 p-2 border-b border-gray-300">
            <strong>{msg.sender}:</strong> {msg.text}
          </li>
        ))}
      </ul>
      {/* Form to send a new message */}
      <form onSubmit={sendMessage} className="bg-gray-800 p-4 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
