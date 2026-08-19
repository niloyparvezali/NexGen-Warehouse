import { cn } from "../../utils/cn";

const variants = {
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
  danger: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  info: "bg-[var(--color-primary-subtle)] text-[var(--color-primary)]",
  neutral: "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]",
};

const Badge = ({ children, variant = "info", className = "" }) => {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}>{children}</span>;
};

export default Badge;
