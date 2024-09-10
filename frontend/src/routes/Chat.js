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
  const [activeUsers, setActiveUsers] = useState(0);
  // const [accountData, setAccountData] = useState(null);

  const initializeSocket = useCallback(() => {
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
      // Update state with the new message, including the current timestamp
      setMessages((prev) => [...prev, { ...msg, timestamp: new Date() }]);
    });

    newSocket.on("active users", (count) => {
      setActiveUsers(count);
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("chat message");
      newSocket.off("active users");
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

  // New function to fetch account data
  // const fetchAccountData = useCallback(async () => {
  //   try {
  //     const accountId = localStorage.getItem("accountid"); // Assuming you store the account ID in localStorage
  //     if (!accountId) {
  //       console.log("No account ID found in localStorage");
  //       return;
  //     }

  //     const response = await fetch(
  //       `http://localhost:8081/accounts/${accountId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store the auth token in localStorage
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch account data");
  //     }

  //     const data = await response.json();
  //     setAccountData(data);
  //     console.log("Account data:", data.isAdmin);
  //     //console.log(data);
  //   } catch (error) {
  //     console.error("Error fetching account data:", error);
  //   }
  // }, []);

  // // Call fetchAccountData when the component mounts
  // useEffect(() => {
  //   fetchAccountData();
  // }, [fetchAccountData]);

  // Helper function to format the timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {decodeURIComponent(roomName).toUpperCase()}
          </h1>
          <p className="text-sm bg-indigo-500 px-3 py-1 rounded-full">
            Active Users: {activeUsers}
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
              <strong className={"text-blue-700"}>{msg.email}:</strong>
            </div>
            <p className="mb-1 text-gray-700">{msg.text}</p>
            <span className="text-xs text-gray-500">
              {formatTime(msg.timestamp)}
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
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
