import { cn } from "../../utils/cn";

const Card = ({ title, children, className = "", headerAction }) => {
  return (
    <div className={cn("ui-card wc-panel-card rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-sm", className)}>
      {(title || headerAction) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          {title ? <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2> : <div />}
          {headerAction ? <div>{headerAction}</div> : null}
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;
