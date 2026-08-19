import { cn } from "../../utils/cn";

/**
 * FormField - Atomic wrapper for label + control + error
 * Provides consistent spacing and error display
 */
const FormField = ({ label, error, required, className = "", children }) => {
  return (
    <div className={cn("form-field", className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-label-required">*</span>}
        </label>
      )}
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormField;
