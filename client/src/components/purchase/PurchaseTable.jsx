import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";

const PurchaseTable = ({ purchases = [], onEdit, onDelete, onRestore, onView, onPrint }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed index-column-table">
          <colgroup className="index-column-group">
            <col className="index-column" />
          </colgroup>
          <thead className="bg-[var(--surface-muted)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <th className="w-12 px-2 py-3">#</th>
              <th className="w-32 px-4 py-3">Purchase #</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="w-32 px-4 py-3 text-right">Total</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-64 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No purchases found.
                </td>
              </tr>
            ) : (
              purchases.map((purchase, index) => (
                <tr key={purchase.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{purchase.purchaseNumber}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{purchase.supplier?.supplierName || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-right text-[var(--text)]">৳ {formatMoney(purchase.total || 0)}</td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      purchase.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}>
                      {purchase.isActive ? purchase.status || "Completed" : "Deleted"}
                    </span>
                  </td>
                  <td className="w-64 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="secondary" onClick={() => onView(purchase)}>View</Button>
                      <Button size="sm" onClick={() => onPrint(purchase)}>Print</Button>
                      {purchase.isActive ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => onEdit(purchase)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(purchase)}>Delete</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => onRestore(purchase)}>Restore</Button>
                      )}
                    </div>
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

export default PurchaseTable;
