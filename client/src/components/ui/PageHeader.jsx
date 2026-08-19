import { cn } from "../../utils/cn";

const PageHeader = ({
  title,
  subtitle,
  description,
  actions,
  badge,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "page-header wc-page-header grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center",
        className,
      )}
    >
      <div>
        {badge ? (
          <div className="mb-4 inline-flex rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            {badge}
          </div>
        ) : null}
        <div className="space-y-3">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
          </div>
          {description ? <p className="max-w-2xl secondary-text">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center justify-end gap-3">{actions}</div> : null}
    </div>
  );
};

export default PageHeader;
