import React, { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { produitService } from "../services/medicamentService";
import { factureService } from "../services/venteService";


const COULEURS = ["#0d6efd", "#20c997", "#ffc107", "#dc3545", "#6f42c1", "#fd7e14", "#0dcaf0", "#6c757d"];

export default function Dashboard() {

  const [alertesStock, setAlertesStock] = useState([]);
  const [bientotExpires, setBientotExpires] = useState([]);
  const [stats, setStats] = useState([]);
  const [ventesParProduit, setVentesParProduit] = useState([]);
  const [totalProduits, setTotalProduits] = useState(0);
  const [totalVentes, setTotalVentes] = useState({ montant_total: 0, nombre_factures: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stock, expir, statistiques, produitsData, ventesGlobales, repartition] = await Promise.all([
          produitService.alertesStock(),
          produitService.bientotExpires(),
          factureService.statistiques7Jours(),
          produitService.getAll(),
          factureService.totalVentes(),
          factureService.ventesParProduit(),
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
        setVentesParProduit(repartition);
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
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#e0f2fe" }}>
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
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#ede9fe" }}>
                  <i className="bi bi-capsule fs-5" style={{ color: "#7c3aed" }}></i>
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
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#fef3c7" }}>
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
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: "#fee2e2" }}>
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

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-graph-up me-2"></i>Évolution des ventes (7 derniers jours)
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
                  <Bar yAxisId="right" dataKey="quantite_produits" name="Produits vendus" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="montant_total" name="Montant total" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white fw-semibold">
              <i className="bi bi-pie-chart me-2"></i>Quantité vendue par produit
            </div>
            <div className="card-body d-flex flex-column" style={{ height: 320 }}>
              {ventesParProduit.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center flex-fill text-muted small">
                  Aucune vente enregistrée.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={ventesParProduit}
                        dataKey="quantite"
                        nameKey="produit"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={2}
                      >
                        {ventesParProduit.map((_, index) => (
                          <Cell key={index} fill={COULEURS[index % COULEURS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="overflow-auto" style={{ maxHeight: "30%" }}>
                    {ventesParProduit.map((p, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between small py-1">
                        <span>
                          <span
                            className="d-inline-block rounded-circle me-2"
                            style={{ width: 8, height: 8, background: COULEURS[i % COULEURS.length] }}
                          ></span>
                          {p.produit}
                        </span>
                        <span className="fw-semibold">{p.quantite}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}