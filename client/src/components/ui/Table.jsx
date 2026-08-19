import { cn } from "../../utils/cn";

const Table = ({ children, className = "" }) => {
  return (
    <div className="ui-table overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
      <div className="overflow-x-auto">
        <table className={cn("w-full divide-y divide-[var(--border)] table-auto", className)}>
          {children}
        </table>
      </div>
    </div>
  );
};

Table.Header = ({ children, className = "" }) => (
  <thead className="bg-[var(--surface-muted)]">
    <tr className={cn("text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]", className)}>
      {children}
    </tr>
  </thead>
);

Table.Head = ({ children, className = "" }) => (
  <th className={cn("px-4 py-3 text-left whitespace-nowrap", className)}>{children}</th>
);

Table.Body = ({ children, className = "" }) => (
  <tbody className={cn("divide-y divide-[var(--border)]", className)}>{children}</tbody>
);

Table.Row = ({ children, className = "" }) => (
  <tr className={cn("bg-[var(--surface)] transition-colors hover:bg-[var(--surface-light)]", className)}>
    {children}
  </tr>
);

Table.Cell = ({ children, className = "" }) => (
  <td className={cn("px-4 py-3 text-sm text-[var(--text)] align-middle", className)}>{children}</td>
);

Table.Empty = ({ children = "No records found." }) => (
  <tr>
    <td colSpan="100" className="px-4 py-10 text-center text-sm text-[var(--text-secondary)] bg-[var(--surface-light)]">
      {children}
    </td>
  </tr>
);

export default Table;
