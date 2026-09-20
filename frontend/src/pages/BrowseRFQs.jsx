import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import { EmptyState, ErrorBox, Loading } from "../components/UiStates";

export default function BrowseRFQs() {
  const [rfqs, setRfqs] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const load = () => {
    setError("");
    setRfqs(null);
    const params = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    api
      .get("/rfqs/", { params })
      .then(({ data }) => setRfqs(data.results ?? data))
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, [ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Browse RFQs</h1>
      </div>

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search by product, description or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-created_at">Newest first</option>
          <option value="deadline">Deadline (soonest)</option>
          <option value="-quantity">Quantity (highest)</option>
        </select>
        <button className="btn-primary" type="submit">Search</button>
      </form>

      {error && <ErrorBox message={error} onRetry={load} />}
      {!error && rfqs === null && <Loading text="Loading RFQs..." />}
      {!error && rfqs !== null && rfqs.length === 0 && (
        <EmptyState message="No open RFQs match your search right now." />
      )}
      {!error && rfqs !== null && rfqs.length > 0 && (
        <div className="card-grid">
          {rfqs.map((rfq) => (
            <Link to={`/supplier/rfqs/${rfq.id}`} key={rfq.id} className="card rfq-card">
              <div className="rfq-card-header">
                <h3>{rfq.product_name}</h3>
                <span className={`badge badge-${rfq.status.toLowerCase()}`}>{rfq.status}</span>
              </div>
              <p className="muted">{rfq.description.slice(0, 100)}{rfq.description.length > 100 ? "..." : ""}</p>
              <div className="rfq-card-meta">
                <span>Qty: {rfq.quantity} {rfq.unit}</span>
                <span>{rfq.delivery_location}</span>
              </div>
              <div className="rfq-card-footer">
                <span>Deadline: {rfq.deadline}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
