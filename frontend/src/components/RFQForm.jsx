import { useState } from "react";

const emptyForm = {
  product_name: "",
  description: "",
  quantity: "",
  unit: "units",
  delivery_location: "",
  deadline: "",
};

export default function RFQForm({ initialValues, onSubmit, submitting, submitLabel = "Save" }) {
  const [form, setForm] = useState({ ...emptyForm, ...(initialValues || {}) });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const validate = () => {
    const errors = {};
    if (!form.product_name.trim()) errors.product_name = "Product/service name is required.";
    if (!form.description.trim()) errors.description = "Description is required.";
    if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = "Quantity must be greater than zero.";
    if (!form.delivery_location.trim()) errors.delivery_location = "Delivery location is required.";
    if (!form.deadline) errors.deadline = "Deadline is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, quantity: Number(form.quantity) });
  };

  return (
    <form className="card rfq-form" onSubmit={handleSubmit}>
      <label>
        Product / Service Name
        <input type="text" value={form.product_name} onChange={handleChange("product_name")} />
        {fieldErrors.product_name && <span className="field-error">{fieldErrors.product_name}</span>}
      </label>

      <label>
        Requirement Description
        <textarea rows={4} value={form.description} onChange={handleChange("description")} />
        {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
      </label>

      <div className="form-row">
        <label>
          Quantity
          <input type="number" min="1" value={form.quantity} onChange={handleChange("quantity")} />
          {fieldErrors.quantity && <span className="field-error">{fieldErrors.quantity}</span>}
        </label>
        <label>
          Unit
          <input type="text" value={form.unit} onChange={handleChange("unit")} placeholder="e.g. pcs, kg, boxes" />
        </label>
      </div>

      <label>
        Delivery Location
        <input type="text" value={form.delivery_location} onChange={handleChange("delivery_location")} />
        {fieldErrors.delivery_location && <span className="field-error">{fieldErrors.delivery_location}</span>}
      </label>

      <label>
        RFQ Deadline
        <input type="date" value={form.deadline} onChange={handleChange("deadline")} />
        {fieldErrors.deadline && <span className="field-error">{fieldErrors.deadline}</span>}
      </label>

      <button className="btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
