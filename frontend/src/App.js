/* eslint-disable jsx-a11y/anchor-has-content */
import { useState, useEffect } from "react";
// Disabling eslint for unused imports
import { BrowserRouter as Route, Routes } from "react-router-dom";

import Header from "./Components/Header"; // Importing the Header component
import Card from "./Components/Card"; // Importing the Card component to display event details
import konferencija from "./Components/assets/Konferencija.jpg"; // Importing an image for events
import Login from "./routes/Login"; // Importing the Login component
import Registration from "./routes/Registration"; // Importing the Registration component
import PrivateRoute from "./Components/PrivateRoute"; // Importing PrivateRoute for protected routes
import AdminAddEvent from "./routes/AdminAddEvent"; // Importing the AdminAddEvent component
import Unauthorized from "./routes/Unauthorized"; // Importing the Unauthorized component

import { useAuth } from "./context/AuthContext"; // Importing the AuthContext for authentication

function Data() {
  // State to store the event data fetched from the server
  const [eventData, setEventData] = useState([]);
  const { user } = useAuth(); // Getting the authenticated user from context

  // Fetch all events from the server when the component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8081/view/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Passing the JWT token for authorization
          },
        });

        // Handle any errors that occur during the fetch
        if (!response.ok) {
          throw new Error("Network problem");
        }

        const data = await response.json(); // Parse the JSON data from the response
        setEventData(data); // Update the state with the fetched event data
      } catch (error) {
        console.error("Error:", error); // Log any errors to the console
      }
    };

    fetchData(); // Call the fetchData function
  }, [user.token]); // Run the effect only when the user's token changes

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {Array.isArray(eventData) &&
          eventData.map((event, index) => (
            <Card
              key={event.id}
              price={event.price}
              title={event.title}
              description={event.description}
              location={event.location}
              photo={konferencija}
              attendees={`${event.totalPeople}/${event.maxPeople}`}
              date={event.date}
              eventId={event._id}
              totalPeople={event.totalPeople}
            />
          ))}
      </div>
    </div>
  );
}

function Events() {
  return (
    <div>
      <Header />
      <Data />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/events"
        element={
          <PrivateRoute>
            <Events /> {/* Protected route for viewing events */}
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/add-event"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminAddEvent />{" "}
            {/* Protected route for adding events by admin only */}
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Login />} />{" "}
      {/* Default route to Login component */}
    </Routes>
  );
}

export default App;
