import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importing BrowserRouter for routing
import { AuthProvider } from "./context/AuthContext"; // Importing AuthProvider for context-based authentication

import "./index.css";
import App from "./App"; // Importing the main App component

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Provides routing functionality to the app */}
      <AuthProvider>
        {/* Provides authentication context to the app */}
        <App /> {/* Renders the main App component */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
