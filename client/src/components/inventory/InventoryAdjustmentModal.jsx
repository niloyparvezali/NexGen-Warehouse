import { useState } from "react";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const InventoryAdjustmentModal = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  loading,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState("INCREASE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedQuantity = Number(quantity || 0);

    if (!product) return;

    if (!parsedQuantity || parsedQuantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setError("");

    onSubmit({
      productId: product.id,
      quantity:
        adjustmentType === "DECREASE" ? -parsedQuantity : parsedQuantity,
      reference: `ADJ-${product.sku}`,
      note: notes.trim(),
    });
  };

  const resetForm = () => {
    setQuantity(0);
    setAdjustmentType("INCREASE");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adjust Inventory"
      size="md"
    >
      <form onSubmit={handleSubmit} className="wc-form wc-form-compact">
        {error && (
          <p className="rounded-lg border border-[var(--danger-soft)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 p-4">
          <p className="text-sm text-[var(--text-secondary)]">Product</p>
          <p className="font-semibold text-[var(--text)]">
            {product?.name || "-"}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Current stock: {product?.stockQuantity ?? 0}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Adjustment Type
          </label>

          <select
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] outline-none focus:border-primary"
          >
            <option value="INCREASE">Increase Stock</option>
            <option value="DECREASE">Decrease Stock</option>
          </select>
        </div>

        <Input
          label="Quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? "Adjusting..." : "Save Adjustment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryAdjustmentModal;
