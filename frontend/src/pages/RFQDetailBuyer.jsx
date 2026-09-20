import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import { EmptyState, ErrorBox, Loading } from "../components/UiStates";

export default function RFQDetailBuyer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = () => {
    setError("");
    Promise.all([api.get(`/rfqs/${id}/`), api.get(`/quotations/rfq/${id}/`)])
      .then(([rfqRes, quotesRes]) => {
        setRfq(rfqRes.data);
        setQuotes(quotesRes.data.results ?? quotesRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this RFQ? This cannot be undone.")) return;
    setActionError("");
    try {
      await api.delete(`/rfqs/${id}/`);
      navigate("/buyer/rfqs");
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const toggleStatus = async () => {
    setActionError("");
    try {
      const newStatus = rfq.status === "OPEN" ? "CLOSED" : "OPEN";
      const { data } = await api.patch(`/rfqs/${id}/`, { status: newStatus });
      setRfq(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!rfq || quotes === null) return <Loading text="Loading RFQ details..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{rfq.product_name}</h1>
        <span className={`badge badge-${rfq.status.toLowerCase()}`}>{rfq.status}</span>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="card detail-card">
        <p>{rfq.description}</p>
        <div className="detail-grid">
          <div><strong>Quantity</strong><span>{rfq.quantity} {rfq.unit}</span></div>
          <div><strong>Delivery Location</strong><span>{rfq.delivery_location}</span></div>
          <div><strong>Deadline</strong><span>{rfq.deadline}</span></div>
          <div><strong>Posted</strong><span>{new Date(rfq.created_at).toLocaleDateString()}</span></div>
        </div>
        <div className="detail-actions">
          <Link className="btn-secondary" to={`/buyer/rfqs/${id}/edit`}>Edit</Link>
          <button className="btn-secondary" onClick={toggleStatus}>
            Mark as {rfq.status === "OPEN" ? "Closed" : "Open"}
          </button>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <h2>Quotations Received ({quotes.length})</h2>
      {quotes.length === 0 ? (
        <EmptyState message="No suppliers have quoted on this RFQ yet." />
      ) : (
        <div className="card-grid">
          {quotes.map((q) => (
            <div className="card quote-card" key={q.id}>
              <h3>{q.supplier_company || q.supplier_username}</h3>
              <div className="detail-grid">
                <div><strong>Quoted Price</strong><span>₹{q.quoted_price}</span></div>
                <div><strong>Est. Delivery</strong><span>{q.estimated_delivery_days} day(s)</span></div>
              </div>
              {q.message && <p className="muted">"{q.message}"</p>}
              <p className="muted small">Submitted {new Date(q.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
