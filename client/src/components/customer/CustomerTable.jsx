import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";

const CustomerTable = ({ customers = [], onEdit, onDelete, onRestore }) => {
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
              <th className="px-4 py-3">Name</th>
              <th className="w-32 px-4 py-3">Phone</th>
              <th className="w-40 px-4 py-3">Email</th>
              <th className="w-32 px-4 py-3">City</th>
              <th className="w-32 px-4 py-3">Type</th>
              <th className="w-32 px-4 py-3 text-right">Balance</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-56 px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <tr key={customer.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{customer.name}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{customer.phone || "—"}</td>
                  <td className="w-40 px-4 py-3 text-sm text-[var(--text-secondary)]">{customer.email || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{customer.city || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{customer.customerType || "RETAIL"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)] text-right">৳ {formatMoney(customer.currentBalance || 0)}</td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      customer.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="w-56 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {customer.isActive ? (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => onEdit(customer)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(customer)}>Delete</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => onRestore(customer)}>Restore</Button>
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

export default CustomerTable;
