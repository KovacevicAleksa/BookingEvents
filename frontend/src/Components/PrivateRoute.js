import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, adminOnly = false }) => {
  // Retrieve the current user from the Auth context
  const { user } = useAuth();

  // If the user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the route is admin-only and the user is not an admin, redirect to the unauthorized page
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/unauthorized" />; // Redirect to unauthorized page
  }

  // If the user is authorized, render the child components
  return children;
};

export default PrivateRoute;
