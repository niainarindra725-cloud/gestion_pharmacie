import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { produitService } from "../../services/medicamentService";
import "./Layout.css";

const MENU = [
  { to: "/dashboard", label: "Tableau de bord", icon: "bi-speedometer2" },
  { to: "/medicaments", label: "Médicaments", icon: "bi-capsule" },
  { to: "/stock", label: "Approvisionnement", icon: "bi-box-seam" },
  { to: "/ventes", label: "Nouvelle vente", icon: "bi-cart-check" },
  { to: "/factures", label: "Factures", icon: "bi-receipt" },
  { to: "/clients", label: "Clients", icon: "bi-people" },
  { to: "/fournisseurs", label: "Fournisseurs", icon: "bi-truck" },
  { to: "/categories", label: "Catégories", icon: "bi-tags" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";

  const [notifications, setNotifications] = useState([]);
 

  useEffect(() => {
    const chargerNotifications = async () => {
      try {
        const [stock, expir] = await Promise.all([
          produitService.alertesStock(),
          produitService.bientotExpires(),
        ]);
        const notifsStock = stock.map((p) => ({
          type: "warning",
          icon: "bi-exclamation-triangle",
          message: `Stock faible : ${p.nom} (${p.quantite_stock} restants)`,
        }));
        const notifsExpir = expir.map((p) => ({
          type: "danger",
          icon: "bi-hourglass-split",
          message: `${p.nom} expire le ${p.date_expiration}`,
        }));
        setNotifications([...notifsStock, ...notifsExpir]);
      } catch (err) {
        console.error(err);
      }
    };
    chargerNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <aside className="app-sidebar d-flex flex-column justify-content-between text-white p-3" style={{ background: "#1e293b" }}>
        <div>
          <h4 className="mb-4 px-2">
            <i className="bi bi-capsule-pill me-2"></i>Pharmacie
          </h4>
          <p className="text-uppercase small text-white-50 px-2 mb-2" style={{ fontSize: "0.7rem" }}>
            Menu
          </p>
          <ul className="nav nav-pills flex-column gap-1">
            {MENU.map((item) => (
              <li className="nav-item" key={item.to}>
                <Link
                  to={item.to}
                  className={`nav-link d-flex align-items-center gap-2 ${
                    location.pathname === item.to ? "active" : "text-white-50"
                  }`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li className="nav-item">
                <Link
                  to="/utilisateurs"
                  className={`nav-link d-flex align-items-center gap-2 ${
                    location.pathname === "/utilisateurs" ? "active" : "text-white-50"
                  }`}
                >
                  <i className="bi bi-person-check"></i>
                  Utilisateurs
                </Link>
              </li>
            )}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Déconnexion
        </button>
      </aside>

      {/* Navbar fixe */}
      <header className="app-navbar bg-white border-bottom shadow-sm d-flex align-items-center justify-content-end px-4">

        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <div className="dropdown">
            <button
              className="btn btn-light position-relative rounded-circle"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-bell fs-5"></i>
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.length}
                </span>
              )}
            </button>
            <div className="dropdown-menu dropdown-menu-end notif-dropdown p-0">
              <div className="px-3 py-2 border-bottom fw-semibold">Notifications</div>
              {notifications.length === 0 ? (
                <p className="text-muted small text-center py-3 mb-0">
                  Aucune notification.
                </p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className={`notif-item px-3 py-2 border-bottom small ${n.type}`}>
                    <i className={`bi ${n.icon} me-2`}></i>
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profil utilisateur */}
          <div className="dropdown">
            <button
              className="btn btn-light d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle fs-4 text-secondary"></i>
              <div className="text-start d-none d-md-block">
                <div className="fw-semibold small">{user?.nom}</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                  {user?.role}
                </div>
              </div>
              <i className="bi bi-chevron-down small"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="app-content p-4 bg-light">
        <Outlet />
      </main>
    </div>
  );
}