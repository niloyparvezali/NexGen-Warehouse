import Button from "../ui/Button";
import { formatMoney } from "../../utils/formatters";

const ExpenseTable = ({ expenses = [], onEdit, onDelete, onRestore }) => {
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
              <th className="px-4 py-3">Expense</th>
              <th className="w-40 px-4 py-3">Category</th>
              <th className="w-32 px-4 py-3">Date</th>
              <th className="w-32 px-4 py-3 text-right">Amount</th>
              <th className="w-28 px-4 py-3">Payment</th>
              <th className="w-32 px-4 py-3">Reference</th>
              <th className="w-40 px-4 py-3">Created By</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-48 px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((expense, index) => (
                <tr key={expense.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>

                  <td className="px-4 py-3 text-sm">
                    <div className="font-semibold text-[var(--text)]">{expense.expenseNumber}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{expense.description || "—"}</div>
                  </td>

                  <td className="w-40 px-4 py-3 text-sm text-[var(--text)]">{expense.category || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-right text-[var(--text)]">৳ {formatMoney(expense.amount || 0)}</td>
                  <td className="w-28 px-4 py-3 text-sm text-[var(--text)]">{expense.paymentMethod || "—"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{expense.referenceNumber || "—"}</td>
                  <td className="w-40 px-4 py-3 text-sm text-[var(--text)]">
                    {expense.createdBy
                      ? `${expense.createdBy.first_name || ""} ${expense.createdBy.last_name || ""}`.trim() || "—"
                      : "—"}
                  </td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      expense.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}>
                      {expense.isActive ? "Active" : "Deleted"}
                    </span>
                  </td>
                  <td className="w-48 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {expense.isActive ? (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => onEdit(expense)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(expense)}>Delete</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => onRestore(expense)}>Restore</Button>
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

export default ExpenseTable;
