import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { produitService } from "../../services/medicamentService";
import "./Layout.css";

const MENU = [
  { to: "/dashboard", label: "Tableau de bord", icon: "bi-speedometer2" },
  { to: "/medicaments", label: "Médicaments", icon: "bi-capsule" },
  { to: "/categories", label: "Catégories", icon: "bi-tags" },
  { to: "/stock", label: "Approvisionnement", icon: "bi-box-seam" },
  { to: "/ventes", label: "Nouvelle vente", icon: "bi-cart-check" },
  { to: "/factures", label: "Factures", icon: "bi-receipt" },
  { to: "/clients", label: "Clients", icon: "bi-people" },
  { to: "/fournisseurs", label: "Fournisseurs", icon: "bi-truck" },
  { to: "/a-propos", label: "A Propos", icon: "bi bi-exclamation-square" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN" || user?.is_superuser;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}></div>}
      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="sidebar-brand text-white">
          <div className="sidebar-brand-icon">
            <i className="bi bi-heart-pulse"></i>
          </div>
          <span className="fw-bold">Pharmacie</span>
          <button
            className="btn btn-sm text-white ms-auto d-lg-none"
            onClick={() => setMobileOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="sidebar-scroll">
          <nav className="sidebar-nav">
            {MENU.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/utilisateurs"
                className={`sidebar-link ${location.pathname === "/utilisateurs" ? "active" : ""}`}
                title={collapsed ? "Utilisateurs" : ""}
              >
                <i className="bi bi-person-check"></i>
                <span>Utilisateurs</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-link w-100 justify-content-center"
            style={{ background: "#dc2626", color: "#fff", border: "none" }}
            title={collapsed ? "Déconnexion" : ""}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <header
        className={`app-navbar bg-white border-bottom shadow-sm d-flex align-items-center justify-content-between px-4 ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <button className="btn btn-light d-lg-none" onClick={() => setMobileOpen(true)}>
          <i className="bi bi-list fs-4"></i>
        </button>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <div className="dropdown">
            <button className="btn btn-light position-relative rounded-circle" data-bs-toggle="dropdown">
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
                <p className="text-muted small text-center py-3 mb-0">Aucune notification.</p>
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

          <div className="dropdown">
            <button className="btn btn-light d-flex align-items-center gap-2" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle fs-4 text-secondary"></i>
              <div className="text-start d-none d-md-block">
                <div className="fw-semibold small">{user?.nom}</div>
                <div className="text-muted" style={{ fontSize: "0.7rem" }}>{user?.role}</div>
              </div>
              <i className="bi bi-chevron-down small"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text small fw-semibold d-md-none">{user?.nom}</span>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main className={`app-content p-2 p-md-4 bg-light ${collapsed ? "collapsed" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}