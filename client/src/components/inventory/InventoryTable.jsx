import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";

const InventoryTable = ({ items = [], onAdjust }) => {
  return (
    <div className="inventory-table overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-[var(--surface-muted)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <th className="px-4 py-3">Product</th>
              <th className="w-32 px-4 py-3">Barcode</th>
              <th className="w-24 px-4 py-3">SKU</th>
              <th className="w-32 px-4 py-3">Category</th>
              <th className="w-32 px-4 py-3">Brand</th>
              <th className="w-28 px-4 py-3">Unit</th>
              <th className="w-20 px-4 py-3 text-center">Stock</th>
              <th className="w-20 px-4 py-3 text-center">Min</th>
              <th className="w-32 px-4 py-3 text-right">Value</th>
              <th className="w-28 px-4 py-3">Status</th>
              <th className="w-24 px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="px-4 py-3 text-sm">
                    <div className="product-name font-medium text-[var(--text)]">{item.name}</div>
                  </td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{item.barcode || "-"}</td>
                  <td className="w-24 px-4 py-3 text-sm text-[var(--text-secondary)]">{item.sku}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{item.category?.name || "-"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{item.brand?.name || "-"}</td>
                  <td className="w-28 px-4 py-3 text-sm text-[var(--text-secondary)]">{item.unit?.name || "-"}</td>
                  <td className="w-20 px-4 py-3 text-sm text-center text-[var(--text)]">{item.stockQuantity}</td>
                  <td className="w-20 px-4 py-3 text-sm text-center text-[var(--text-secondary)]">{item.minimumStock}</td>
                  <td className="w-32 px-4 py-3 text-sm text-right text-[var(--text)]">৳ {formatMoney(item.stockValue || 0)}</td>
                  <td className="w-28 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      item.isLowStock ? "bg-[var(--warning)]" : "bg-[var(--success)]"
                    }`}>
                      {item.stockStatus}
                    </span>
                  </td>
                  <td className="w-24 px-4 py-3 text-sm">
                    <Button size="sm" onClick={() => onAdjust(item)}>Adjust</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
