import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api, setAuthToken } from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; user: User | null; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper to get user role from token
const getRoleFromToken = (token) => {
  // ... existing code ...
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/auth/validate");
          if (response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            setAuthToken(token);
          } else {
            throw new Error("Invalid user data");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { username, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${user.full_name}!`);
      return { success: true, user };
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
