import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

// Create the AuthContext with a default value of null
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state to store the user data
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve the token from localStorage when the component mounts
    // JWT TOKEN later need to store in HttpOnly cookie
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
    setIsLoading(false);
  }, []);

  const login = (token, isAdmin) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ token, ...decoded, isAdmin });
  };

  // Function to handle user logout, clearing the token and user state
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Provide the user data and authentication functions to the rest of the app
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the AuthContext
export const useAuth = () => useContext(AuthContext);
