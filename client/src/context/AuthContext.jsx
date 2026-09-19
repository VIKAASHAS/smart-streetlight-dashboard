import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("streetlight_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.role) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error loading user from localStorage:", e);
    }
    return null;
  });

  const login = async (identifier, password, role, customName) => {
    try {
      const res = await fetch("https://smart-streetlight-dashboard-2.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid username/email or password." };
      }

      let userObj = data.user;
      if (role === "user" && customName && customName.trim()) {
        userObj = { ...userObj, name: customName.trim() };
      }

      setUser(userObj);
      localStorage.setItem("streetlight_user", JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: "Network error connecting to authentication service." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("streetlight_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => ({ success: false, error: "AuthContext not provided" }),
      logout: () => {},
      isAuthenticated: false
    };
  }
  return context;
};
