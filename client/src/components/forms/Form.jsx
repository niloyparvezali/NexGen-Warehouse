import { cn } from "../../utils/cn";

/**
 * Form - Root form wrapper
 * Provides consistent spacing and structure for all form types
 * Works as a container for FormSection components
 */
const Form = ({ onSubmit, children, className = "", compact = false }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "form-root",
        compact && "form-root--compact",
        className
      )}
    >
      {children}
    </form>
  );
};

export default Form;
