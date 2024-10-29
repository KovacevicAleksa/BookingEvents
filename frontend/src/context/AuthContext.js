import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle user logout, clearing the token and user state
  // Wrap logout in useCallback to memoize it
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login"); // Redirect to login page after logout
  }, [navigate]); // navigate is stable and doesn't need to be in the dependency array

  useEffect(() => {
    // Retrieve the token from localStorage when the component mounts
    // JWT TOKEN later need to store in HttpOnly cookie
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Attempt to decode the token and set the user state
        const decoded = jwtDecode(token);
        // Check if the token has expired
        if (decoded.exp * 1000 < Date.now()) {
          // Token has expired, log out the user
          logout();
        } else {
          setUser({ token, ...decoded });
        }
      } catch (error) {
        // If there's an error decoding, remove the invalid token
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, [logout]); // Add logout to the dependency array

  const login = (token, isAdmin) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ token, ...decoded, isAdmin });
  };

  // New function to check token expiration
  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return false;
      }
    }
    return true;
  }, [logout]);

  // Provide the user data and authentication functions to the rest of the app
  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, checkTokenExpiration }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the AuthContext
export const useAuth = () => useContext(AuthContext);
