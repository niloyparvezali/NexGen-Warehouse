import { cn } from "../../utils/cn";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants = {
    primary: "bg-[var(--color-button-primary)] text-[var(--color-text-inverse)] hover:bg-[var(--color-button-primary-hover)] active:bg-[var(--color-button-primary-active)] shadow-sm",
    success: "bg-[var(--color-success)] text-[var(--color-on-success)] hover:opacity-90 shadow-sm",
    danger: "bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:opacity-90 shadow-sm",
    secondary: "bg-[var(--color-button-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-button-secondary-hover)] active:bg-[var(--color-button-secondary-active)] shadow-sm",
    outline: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
    ghost: "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
  };

  const sizes = {
    sm: "btn-compact text-sm",
    md: "btn-normal text-sm",
    lg: "btn-normal text-base",
  };

  return (
    <button
      data-ui-size={size}
      type={type}
      className={cn(
        "ui-button inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap",
        variants[variant],
        sizes[size],
        {
          "ui-button--primary": variant === "primary",
          "ui-button--secondary": variant === "secondary",
          "ui-button--outline": variant === "outline",
          "ui-button--danger": variant === "danger",
          "ui-button--success": variant === "success",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
