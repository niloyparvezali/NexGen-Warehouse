import Button from "./Button";
import { cn } from "../../utils/cn";
import { getSafePagination } from "../../hooks/useSafePagination";

const Pagination = ({ page, totalPages, onPrevious, onNext, className = "" }) => {
  const {
    currentPage,
    totalPages: safeTotalPages,
    hasPreviousPage,
    hasNextPage,
  } = getSafePagination(page, totalPages);

  return (
    <div className={cn("ui-pagination flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)] shadow-sm", className)}>
      <div className="flex items-center gap-2">
        <span className="text-[var(--text)]">Page</span>
        <span className="inline-flex items-center rounded-lg bg-[var(--surface-muted)] px-3 py-1 font-semibold text-[var(--text)]">{currentPage}</span>
        <span className="text-[var(--text)]">of</span>
        <span className="inline-flex items-center rounded-lg bg-[var(--surface-muted)] px-3 py-1 font-semibold text-[var(--text)]">{safeTotalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (hasPreviousPage) onPrevious?.();
          }}
          disabled={!hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (hasNextPage) onNext?.();
          }}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
