import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import { EmptyState, ErrorBox, Loading } from "../components/UiStates";

export default function BuyerRFQList() {
  const [rfqs, setRfqs] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    setRfqs(null);
    api
      .get("/rfqs/mine/")
      .then(({ data }) => setRfqs(data.results ?? data))
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, []);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (rfqs === null) return <Loading text="Loading your RFQs..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>My RFQs</h1>
        <Link className="btn-primary" to="/buyer/rfqs/new">
          + Create RFQ
        </Link>
      </div>

      {rfqs.length === 0 ? (
        <EmptyState
          message="You haven't posted any RFQs yet."
          action={
            <Link className="btn-primary" to="/buyer/rfqs/new">
              Create your first RFQ
            </Link>
          }
        />
      ) : (
        <div className="card-grid">
          {rfqs.map((rfq) => (
            <Link to={`/buyer/rfqs/${rfq.id}`} key={rfq.id} className="card rfq-card">
              <div className="rfq-card-header">
                <h3>{rfq.product_name}</h3>
                <span className={`badge badge-${rfq.status.toLowerCase()}`}>{rfq.status}</span>
              </div>
              <p className="muted">{rfq.description.slice(0, 100)}{rfq.description.length > 100 ? "..." : ""}</p>
              <div className="rfq-card-meta">
                <span>Qty: {rfq.quantity} {rfq.unit}</span>
                <span>Deadline: {rfq.deadline}</span>
              </div>
              <div className="rfq-card-footer">
                <strong>{rfq.quotation_count} quotation{rfq.quotation_count !== 1 ? "s" : ""} received</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
