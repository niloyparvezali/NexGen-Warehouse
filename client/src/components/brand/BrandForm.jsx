import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const BrandForm = ({ initialData = { id: null, name: "" }, onSubmit, loading = false }) => {
  const [name, setName] = useState(initialData.name || "");
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData?.id);
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim()) { setError("Brand name is required."); return; } setError(""); onSubmit({ name: name.trim() }); };
  return (
    <form onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Brand details</h3><p className="wc-form-section__hint">Keep brand names consistent so products are easier to find and report on.</p></div></div><Input label="Brand name" placeholder="e.g. Logitech" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} error={error} autoFocus /></section>
      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update brand" : "Save brand")}</Button></div>
    </form>
  );
};
export default BrandForm;
