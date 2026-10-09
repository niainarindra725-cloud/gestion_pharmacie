import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-4">Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}