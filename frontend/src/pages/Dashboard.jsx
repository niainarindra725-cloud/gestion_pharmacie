import React, { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { produitService } from "../services/medicamentService";
import { factureService } from "../services/venteService";


export default function Dashboard() {
  const [alertesStock, setAlertesStock] = useState([]);
  const [bientotExpires, setBientotExpires] = useState([]);
  const [stats, setStats] = useState([]);
  const [totalProduits, setTotalProduits] = useState(0);
  const [totalVentes, setTotalVentes] = useState({ montant_total: 0, nombre_factures: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stock, expir, statistiques, produitsData, ventesGlobales] = await Promise.all([
          produitService.alertesStock(),
          produitService.bientotExpires(),
          factureService.statistiques7Jours(),
          produitService.getAll(),
          factureService.totalVentes(),
        ]);
        setAlertesStock(stock);
        setBientotExpires(expir);
        setStats(
          statistiques.map((s) => ({
            ...s,
            jour: new Date(s.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
            }),
          }))
        );
        setTotalProduits(produitsData.count ?? (produitsData.results || produitsData).length);
        setTotalVentes(ventesGlobales);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      
      {/* Cartes statistiques */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: "#e0f2fe" }}
                >
                  <i className="bi bi-cash-stack text-primary fs-5"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Montant total des ventes</p>
                  <h4 className="mb-0">{totalVentes.montant_total.toFixed(2)}</h4>
                </div>
              </div>
              <span className="text-success small">
                <i className="bi bi-arrow-up me-1"></i>{totalVentes.nombre_factures} factures
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: "#ede9fe" }}
                >
                  <i className="bi bi-capsule text-purple fs-5" style={{ color: "#7c3aed" }}></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Nombre total de produits</p>
                  <h4 className="mb-0">{totalProduits}</h4>
                </div>
              </div>
              <span className="text-muted small">Catalogue médicaments</span>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: "#fef3c7" }}
                >
                  <i className="bi bi-exclamation-triangle text-warning fs-5"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Alertes de stock</p>
                  <h4 className="mb-0">{alertesStock.length}</h4>
                </div>
              </div>
              <span className="text-warning small">Produits sous le seuil</span>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: "#fee2e2" }}
                >
                  <i className="bi bi-hourglass-split text-danger fs-5"></i>
                </div>
                <div>
                  <p className="text-muted mb-0 small">Expirations proches</p>
                  <h4 className="mb-0">{bientotExpires.length}</h4>
                </div>
              </div>
              <span className="text-danger small">Dans les 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique + Notifications */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
              <span><i className="bi bi-graph-up me-2"></i>Évolution des ventes (7 derniers jours)</span>
            </div>
            <div className="card-body" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="jour" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="right"
                    dataKey="quantite_produits"
                    name="Produits vendus"
                    fill="#93c5fd"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="montant_total"
                    name="Montant total"
                    stroke="#0d6efd"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-bell me-2"></i>Notifications
            </div>
            <div className="card-body p-0" style={{ maxHeight: 320, overflowY: "auto" }}>
              {alertesStock.length === 0 && bientotExpires.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0 small">
                  Aucune alerte pour le moment.
                </p>
              ) : (
                <ul className="list-group list-group-flush">
                  {alertesStock.map((p) => (
                    <li key={`s-${p.id}`} className="list-group-item small">
                      <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                      Stock faible : <strong>{p.nom}</strong> ({p.quantite_stock} restants)
                    </li>
                  ))}
                  {bientotExpires.map((p) => (
                    <li key={`e-${p.id}`} className="list-group-item small">
                      <i className="bi bi-hourglass-split text-danger me-2"></i>
                      <strong>{p.nom}</strong> expire le {p.date_expiration}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}