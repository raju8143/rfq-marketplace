import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import { ErrorBox, Loading } from "../components/UiStates";

export default function RFQDetailSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ quoted_price: "", estimated_delivery_days: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = () => {
    setError("");
    api
      .get(`/rfqs/${id}/`)
      .then(({ data }) => setRfq(data))
      .catch((err) => setError(extractErrorMessage(err)));
  };

  useEffect(load, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      await api.post("/quotations/", {
        rfq: Number(id),
        quoted_price: form.quoted_price,
        estimated_delivery_days: Number(form.estimated_delivery_days),
        message: form.message,
      });
      setSuccess(true);
      setTimeout(() => navigate("/supplier/quotations"), 1000);
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!rfq) return <Loading text="Loading RFQ details..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{rfq.product_name}</h1>
        <span className={`badge badge-${rfq.status.toLowerCase()}`}>{rfq.status}</span>
      </div>

      <div className="card detail-card">
        <p>{rfq.description}</p>
        <div className="detail-grid">
          <div><strong>Quantity</strong><span>{rfq.quantity} {rfq.unit}</span></div>
          <div><strong>Delivery Location</strong><span>{rfq.delivery_location}</span></div>
          <div><strong>Deadline</strong><span>{rfq.deadline}</span></div>
          <div><strong>Posted by</strong><span>{rfq.buyer_name || rfq.buyer_username}</span></div>
        </div>
      </div>

      {rfq.status !== "OPEN" ? (
        <div className="alert alert-error">This RFQ is closed and no longer accepting quotations.</div>
      ) : (
        <form className="card rfq-form" onSubmit={handleSubmit}>
          <h2>Submit a Quotation</h2>
          {submitError && <div className="alert alert-error">{submitError}</div>}
          {success && <div className="alert alert-success">Quotation submitted! Redirecting...</div>}

          <div className="form-row">
            <label>
              Quoted Price (₹)
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.quoted_price}
                onChange={(e) => setForm({ ...form, quoted_price: e.target.value })}
              />
            </label>
            <label>
              Estimated Delivery (days)
              <input
                type="number"
                min="1"
                required
                value={form.estimated_delivery_days}
                onChange={(e) => setForm({ ...form, estimated_delivery_days: e.target.value })}
              />
            </label>
          </div>
          <label>
            Message / Notes
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Any additional details for the buyer..."
            />
          </label>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quotation"}
          </button>
        </form>
      )}
    </div>
  );
}
