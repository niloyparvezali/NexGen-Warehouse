import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const UnitForm = ({ initialData = { id: null, name: "", symbol: "" }, onSubmit, loading = false }) => {
  const [name, setName] = useState(initialData.name || "");
  const [symbol, setSymbol] = useState(initialData.symbol || "");
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData?.id);
  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim()) { setError("Unit name is required."); return; } if (!symbol.trim()) { setError("Unit symbol is required."); return; } setError(""); onSubmit({ name: name.trim(), symbol: symbol.trim() }); };
  return (
    <form onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}
      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Unit details</h3><p className="wc-form-section__hint">Define the name and short symbol used across products and transactions.</p></div></div><div className="wc-form-grid wc-form-grid--2"><Input label="Unit name" placeholder="e.g. Piece" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} autoFocus /><Input label="Symbol" placeholder="e.g. pcs" value={symbol} onChange={(e) => { setSymbol(e.target.value); if (error) setError(""); }} /></div></section>
      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update unit" : "Save unit")}</Button></div>
    </form>
  );
};
export default UnitForm;
