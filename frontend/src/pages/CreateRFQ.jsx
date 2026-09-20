import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { extractErrorMessage } from "../api/axios";
import RFQForm from "../components/RFQForm";

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/rfqs/", values);
      navigate(`/buyer/rfqs/${data.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Create RFQ</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <RFQForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create RFQ" />
    </div>
  );
}
