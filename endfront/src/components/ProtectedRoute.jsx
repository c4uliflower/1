import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api.js";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/me");
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return null; // prevents flicker

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
