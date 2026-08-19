import { useState } from "react";
import AuthContext from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined" || storedUser === "null") {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = (userData, token) => {
    const safeUser = {
      ...userData,
      permissions: userData?.permissions ?? userData?.rolePermissions ?? {},
      rolePermissions: userData?.rolePermissions ?? userData?.permissions ?? {},
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(safeUser));

    setUser(safeUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
