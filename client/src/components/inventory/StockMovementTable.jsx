const StockMovementTable = ({ movements = [] }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-[var(--surface-muted)]">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <th className="w-40 px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="w-32 px-4 py-3">Barcode</th>
              <th className="w-28 px-4 py-3">Type</th>
              <th className="w-24 px-4 py-3 text-center">In</th>
              <th className="w-24 px-4 py-3 text-center">Out</th>
              <th className="w-24 px-4 py-3 text-center">Balance</th>
              <th className="w-32 px-4 py-3">Reference</th>
              <th className="w-40 px-4 py-3">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {movements.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No stock movements found.
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-40 px-4 py-3 text-sm text-[var(--text-secondary)]">{new Date(movement.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{movement.product?.name || "-"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{movement.product?.barcode || "-"}</td>
                  <td className="w-28 px-4 py-3 text-sm text-[var(--text-secondary)]">{movement.movementType}</td>
                  <td className="w-24 px-4 py-3 text-sm text-center text-[var(--success)]">{movement.quantityIn || 0}</td>
                  <td className="w-24 px-4 py-3 text-sm text-center text-[var(--danger)]">{movement.quantityOut || 0}</td>
                  <td className="w-24 px-4 py-3 text-sm text-center text-[var(--text-secondary)]">{movement.balance}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text-secondary)]">{movement.reference || "-"}</td>
                  <td className="w-40 px-4 py-3 text-sm text-[var(--text-secondary)]">{movement.createdBy ? `${movement.createdBy.first_name} ${movement.createdBy.last_name}`.trim() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovementTable;
