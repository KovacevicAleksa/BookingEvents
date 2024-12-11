import React, { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Registration from "./routes/Registration";
import PrivateRoute from "./Components/PrivateRoute";
import Header from "./Components/Header";
import { useAuth } from "./context/AuthContext";
import config from "./config/config";
import Card from "./Components/Card";
import konferencija from "./Components/assets/Konferencija.jpg";
import hoverPhoto from "./Components/assets/hoverPhoto.gif";

// Lazy-loaded components
const AdminAddEvent = React.lazy(() => import("./routes/AdminAddEvent"));
const HealthCheckDashboard = React.lazy(() => import("./routes/HealthCheck"));
const Unauthorized = React.lazy(() => import("./routes/Unauthorized"));
const ForgotPassword = React.lazy(() => import("./routes/ForgotPassword"));
const ChangePassword = React.lazy(() => import("./routes/ChangePassword"));
const QrCode = React.lazy(() => import("./routes/QrCode"));
const Profile = React.lazy(() => import("./routes/Profile"));
const MyTickets = React.lazy(() => import("./routes/MyTickets"));
const Chat = React.lazy(() => import("./routes/Chat"));
const AboutUs = React.lazy(() => import("./routes/AboutUs"));

// Data component to display events
function Data() {
  const [eventData, setEventData] = React.useState([]);
  const { user, checkTokenExpiration, logout } = useAuth();

  React.useEffect(() => {
    const fetchData = async () => {
      if (!checkTokenExpiration()) {
        return;
      }

      try {
        const response = await fetch(
          `${config.api.baseURL}${config.api.endpoints.viewevents}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            return;
          }
          throw new Error("Network problem");
        }

        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (user && user.token) {
      fetchData();
    }
  }, [user, checkTokenExpiration, logout]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900">
      {Array.isArray(eventData) &&
        eventData.map((event) => (
          <Card
            key={event._id}
            price={event.price}
            title={event.title}
            description={event.description}
            location={event.location}
            photo={konferencija || "https://github.com/user-attachments/assets/f59f4fde-c4c6-4118-bf26-755064981064"}
            hoverPhoto={hoverPhoto || "https://github.com/user-attachments/assets/a181e3fa-f86f-418e-8286-6f533e93c6c5"}
            attendees={`/${event.maxPeople}`}
            date={event.date}
            eventId={event._id}
            totalPeople={event.totalPeople}
          />
        ))}
    </div>
  );
}

export function Events() {
  const { logout, user } = useAuth();

  return (
    <div>
      <Header userEmail={user?.email} onLogout={logout} />
      <Data />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password/:id" element={<ChangePassword />} />
        <Route path="/chat/:roomName" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/about-us" element={<AboutUs />} />

        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
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
        <Route
          path="/admin/healthCheck"
          element={
            <PrivateRoute adminOnly={true}>
              <HealthCheckDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/qrcode"
          element={
            <PrivateRoute organizerOnly={true}>
              <QrCode />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/events" />} />
        <Route path="*" element={<Navigate to="/events" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
