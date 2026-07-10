import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  verifyEmail,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);

  // LOGIN
  const login = async (credentials) => {
    try {
      setLoading(true);

      const res = await loginUser(credentials);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setToken(res.token);
      setUser(res.user);

      return {
        success: true,
        message: res.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  // Does NOT save token because user must verify email first
  const register = async (userData) => {
    try {
      setLoading(true);

      const res = await registerUser(userData);

      return {
        success: true,
        message: res.message,
        user: res.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const verify = async (verificationData) => {
    try {
      setLoading(true);

      const res = await verifyEmail(verificationData);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setToken(res.token);
      setUser(res.user);

      return {
        success: true,
        message: res.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  // Keep user logged in after refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verify,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
