import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

// Create the AuthContext with a default value of null
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state to store the user data
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve the token from localStorage when the component mounts
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Attempt to decode the token and set the user state
        const decoded = jwtDecode(token);
        setUser({ token, ...decoded });
      } catch (error) {
        // If there's an error decoding, remove the invalid token
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Function to handle user login, saving the token and decoding it
  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ token, ...decoded });
  };

  // Function to handle user logout, clearing the token and user state
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Provide the user data and authentication functions to the rest of the app
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the AuthContext
export const useAuth = () => useContext(AuthContext);
