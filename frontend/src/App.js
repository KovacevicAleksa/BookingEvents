import React, { Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Registration from "./routes/Registration";
import PrivateRoute from "./Components/PrivateRoute";
import Header from "./Components/Header";
import { useAuth } from "./context/AuthContext";
import CardData from "./Components/CardData";

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

export function Events() {
  const { logout, user } = useAuth();

  return (
    <div>
      <Header userEmail={user?.email} onLogout={logout} />
      <CardData />
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
