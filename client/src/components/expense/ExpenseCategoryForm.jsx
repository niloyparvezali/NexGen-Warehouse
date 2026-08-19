import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

const ExpenseCategoryForm = ({
  initialData = { id: null, name: "", description: "" },
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData?.id);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setError("");

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wc-form">
      {error && <p className="wc-form-error">{error}</p>}

      <section className="wc-form-section"><div className="wc-form-section__header"><div><h3 className="wc-form-section__title">Expense category</h3><p className="wc-form-section__hint">Name the category clearly so expenses stay easy to understand in reports.</p></div></div>
      <Input
        label="Category name"
        placeholder="Enter category name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError("");
        }}
      />

      <div className="mt-4"><label>Description</label><textarea
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--primary-soft)]"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      </section>

      <div className="wc-form-actions">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit
              ? "Updating..."
              : "Saving..."
            : isEdit
            ? "Update Category"
            : "Save Category"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseCategoryForm;
