import Button from "../ui/Button";

const ProductTable = ({ products = [], onEdit, onDelete, onRestore }) => {
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
              <th className="w-32 px-4 py-3">SKU</th>
              <th className="w-32 px-4 py-3">Category</th>
              <th className="w-32 px-4 py-3">Brand</th>
              <th className="w-28 px-4 py-3">Unit</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-56 px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-8 px-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{product.name}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{product.sku}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{product.category?.name || "-"}</td>
                  <td className="w-32 px-4 py-3 text-sm text-[var(--text)]">{product.brand?.name || "-"}</td>
                  <td className="w-28 px-4 py-3 text-sm text-[var(--text)]">{product.unit?.name || "-"}</td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--text)] ${
                      product.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                    }`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="w-56 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {product.isActive ? (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => onEdit(product)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(product)}>Delete</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="success" onClick={() => onRestore(product)}>Restore</Button>
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

export default ProductTable;
