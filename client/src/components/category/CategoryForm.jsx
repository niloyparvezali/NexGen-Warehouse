import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const CategoryForm = ({ initialData = { id: null, name: "" }, onSubmit, loading = false }) => {
  const [name, setName] = useState(initialData.name || "");
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Category name is required."); return; }
    setError("");
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}
      <section className="wc-form-section">
        <div className="wc-form-section__header">
          <div><h3 className="wc-form-section__title">Category details</h3><p className="wc-form-section__hint">Use a short, clear name that staff can recognize quickly.</p></div>
        </div>
        <div className="wc-form-grid">
          <Input label="Category name" placeholder="e.g. Laptops" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }} error={error} autoFocus />
        </div>
      </section>
      <div className="wc-form-actions"><Button type="submit" disabled={loading}>{loading ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update category" : "Save category")}</Button></div>
    </form>
  );
};
export default CategoryForm;
