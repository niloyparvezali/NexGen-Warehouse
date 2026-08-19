import Button from "../ui/Button";
import { normalizeIntegerInputValue, normalizeNumberInputValue } from "../../utils/numberInput";
import { formatMoney } from "../../utils/formatters";

const PurchaseItemsTable = ({ items = [], onUpdateItem, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-[var(--text-secondary)]">
        No products added yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-[var(--surface-muted)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="w-24 px-4 py-3 text-center">Qty</th>
              <th className="w-32 px-4 py-3 text-right">Unit Cost</th>
              <th className="w-32 px-4 py-3 text-right">Line Total</th>
              <th className="w-24 px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((item, index) => (
              <tr key={`${item.productId}-${index}`} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                <td className="px-4 py-3 text-sm text-[var(--text)]">{item.product?.name || item.name || "—"}</td>
                <td className="w-24 px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onFocus={(e) => {
                      if (e.currentTarget.value === "0") {
                        onUpdateItem(index, "quantity", "");
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value === "") {
                        onUpdateItem(index, "quantity", 1);
                      }
                    }}
                    onChange={(e) => onUpdateItem(index, "quantity", Number(normalizeIntegerInputValue(e.target.value || "1")) || 1)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-primary text-center"
                  />
                </td>
                <td className="w-32 px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.purchasePrice}
                    onFocus={(e) => {
                      if (e.currentTarget.value === "0") {
                        onUpdateItem(index, "purchasePrice", "");
                      }
                    }}
                    onBlur={(e) => {
                      if (e.currentTarget.value === "") {
                        onUpdateItem(index, "purchasePrice", 0);
                      }
                    }}
                    onChange={(e) =>
                      onUpdateItem(
                        index,
                        "purchasePrice",
                        Number(normalizeNumberInputValue(e.target.value, { step: "0.01" }) || 0),
                      )
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm text-[var(--text)] outline-none focus:border-primary text-right"
                  />
                </td>
                <td className="w-32 px-4 py-3 text-sm text-right text-[var(--text)]">৳ {formatMoney(item.quantity * item.purchasePrice || 0)}</td>
                <td className="w-24 px-4 py-3 text-sm">
                  <Button size="sm" variant="danger" onClick={() => onRemoveItem(index)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseItemsTable;
