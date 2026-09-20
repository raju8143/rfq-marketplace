import { useEffect, useState } from "react";
import api, { extractErrorMessage } from "../api/axios";
import { EmptyState, ErrorBox, Loading } from "../components/UiStates";

export default function MyQuotations() {
  const [quotes, setQuotes] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    setQuotes(null);
    api
      .get("/quotations/")
      .then(({ data }) => setQuotes(data.results ?? data))
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, []);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (quotes === null) return <Loading text="Loading your quotations..." />;

  return (
    <div className="page">
      <h1>My Quotations</h1>
      {quotes.length === 0 ? (
        <EmptyState message="You haven't submitted any quotations yet. Browse RFQs to get started." />
      ) : (
        <div className="card-grid">
          {quotes.map((q) => (
            <div className="card quote-card" key={q.id}>
              <h3>{q.rfq_product_name}</h3>
              <p className="muted small">Buyer: {q.buyer_username}</p>
              <div className="detail-grid">
                <div><strong>Your Price</strong><span>₹{q.quoted_price}</span></div>
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
