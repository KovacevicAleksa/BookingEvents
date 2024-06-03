import React from "react";
import { Navigate } from "react-router-dom";

//osnovna autentifikacija bzv
const PrivateRoute = ({ children }) => {
  const isAuthenticated =
    !!localStorage.getItem("token") || !!localStorage.getItem("accountid");

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
