import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Registration from "./routes/Registration";
import PrivateRoute from "./Components/PrivateRoute";
import AdminAddEvent from "./routes/AdminAddEvent";
import Unauthorized from "./routes/Unauthorized";
import ForgotPassword from "./routes/ForgotPassword";
import Header from "./Components/Header";
import Card from "./Components/Card";
import konferencija from "./Components/assets/Konferencija.jpg";
import { useAuth } from "./context/AuthContext";

// Data component to display events
function Data() {
  const [eventData, setEventData] = React.useState([]);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8081/view/events", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network problem");
        }

        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [user.token]);

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

// Events component to wrap the Data component and Header
export function Events() {
  const { user } = useAuth();

  return (
    <div>
      <Header userEmail={user.email} />
      <Data />
    </div>
  );
}

// Main App component with Routes
function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/events"
        element={
          <PrivateRoute>
            {user && user.isAdmin ? (
              <Navigate to="/admin/addEvent" />
            ) : (
              <Events />
            )}
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/addEvent"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminAddEvent />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
