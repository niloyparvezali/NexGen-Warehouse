import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";

const SupplierTable = ({ suppliers = [], onEdit, onDelete }) => {
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
              <th className="px-4 py-3">Supplier</th>
              <th className="w-40 px-4 py-3">Company</th>
              <th className="w-32 px-4 py-3">Mobile</th>
              <th className="w-32 px-4 py-3 text-right">Balance</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-40 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No suppliers found.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={supplier.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-[var(--text)]">{supplier.supplierName}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{supplier.contactPerson}</div>
                  </td>
                  <td className="w-40 px-4 py-3 text-sm text-[var(--text)]">{supplier.companyName || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{supplier.mobileNumber || supplier.phone || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)] text-right">৳ {formatMoney(supplier.currentBalance || 0)}</td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      supplier.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="w-40 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(supplier)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(supplier)}>Delete</Button>
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

export default SupplierTable;
