import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Medicaments from "../pages/Medicaments";
import Categories from "../pages/Categories";
import Stock from "../pages/Stock";
import Ventes from "../pages/Ventes";
import Factures from "../pages/Factures";
import FactureDetail from "../pages/FactureDetail";
import Clients from "../pages/Clients";
import Fournisseurs from "../pages/Fournisseurs";
import UtilisateursEnAttente from "../pages/UtilisateursEnAttente";
import Layout from "../components/common/Layout";
import { useAuth } from "../context/AuthContext";

export default function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="medicaments" element={<Medicaments />} />
        <Route path="categories" element={<Categories />} />
        <Route path="stock" element={<Stock />} />
        <Route path="ventes" element={<Ventes />} />
        <Route path="factures" element={<Factures />} />
        <Route path="factures/:id" element={<FactureDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="fournisseurs" element={<Fournisseurs />} />
        <Route path="utilisateurs" element={<UtilisateursEnAttente />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}