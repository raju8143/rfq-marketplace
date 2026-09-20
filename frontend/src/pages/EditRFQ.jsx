import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import RFQForm from "../components/RFQForm";
import { ErrorBox, Loading } from "../components/UiStates";

export default function EditRFQ() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setLoadError("");
    api
      .get(`/rfqs/${id}/`)
      .then(({ data }) => setRfq(data))
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await api.patch(`/rfqs/${id}/`, values);
      navigate(`/buyer/rfqs/${id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Loading RFQ..." />;
  if (loadError) return <ErrorBox message={loadError} onRetry={load} />;

  return (
    <div className="page">
      <h1>Edit RFQ</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <RFQForm initialValues={rfq} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save Changes" />
    </div>
  );
}
