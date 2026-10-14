import React, { useEffect, useState } from "react";
import { clientService } from "../services/clientService";
import Pagination from "../components/common/Pagination";

const PAR_PAGE = 6;

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const charger = async () => {
    setLoading(true);
    const data = await clientService.getAll({ page_size: 200 });
    setClients(data.results || data);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce client ?")) {
      await clientService.remove(id);
      charger();
    }
  };

  const totalPages = Math.max(1, Math.ceil(clients.length / PAR_PAGE));
  const clientsPage = clients.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  return (
    <div>
      <h2 className="mb-4">
        <i className="bi bi-people me-2"></i>Clients
      </h2>

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsPage.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        Aucun client enregistré.
                      </td>
                    </tr>
                  )}
                  {clientsPage.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">
                        {c.nom}
                      </td>
                      <td>{c.telephone || <span className="text-muted">—</span>}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash me-1"></i>Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="card-footer bg-white d-flex justify-content-center">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}