import Button from "../ui/Button";

const CategoryTable = ({ categories = [], onEdit, onDelete }) => {
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
              <th className="px-4 py-3">Category Name</th>
              <th className="w-32 px-4 py-3">Status</th>
              <th className="w-40 px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-10 px-4 text-center text-[var(--text-secondary)]">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr key={category.id} className="bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]">
                  <td className="w-1 py-3 text-sm text-[var(--text)]">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{category.name}</td>
                  <td className="w-32 px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-[var(--success)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                      Active
                    </span>
                  </td>
                  <td className="w-40 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(category)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(category)}>Delete</Button>
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

export default CategoryTable;
