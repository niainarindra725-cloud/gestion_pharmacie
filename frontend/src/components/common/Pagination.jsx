import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav>
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <li key={n} className={`page-item ${page === n ? "active" : ""}`}>
            <button className="page-link" onClick={() => onChange(n)}>{n}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}