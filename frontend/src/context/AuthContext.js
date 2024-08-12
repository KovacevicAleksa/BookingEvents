import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const accountId = localStorage.getItem("accountid");
    const isAdmin = localStorage.getItem("isAdmin") === "true"; // Convert string to boolean
    if (token && accountId) {
      // Here you would typically verify the token with your backend
      setUser({ token, accountId, isAdmin });
    }
  }, []);

  const login = (token, accountId, isAdmin = false) => {
    localStorage.setItem("token", token);
    localStorage.setItem("accountid", accountId);
    localStorage.setItem("isAdmin", isAdmin.toString()); // Store isAdmin as a string
    setUser({ token, accountId, isAdmin });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accountid");
    localStorage.removeItem("isAdmin");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
