import { cn } from "../../utils/cn";

/**
 * FormSection - Groups related form fields with visual hierarchy
 * Provides title, subtitle/hint, and consistent spacing
 */
const FormSection = ({ title, hint, children, className = "" }) => {
  return (
    <section className={cn("form-section", className)}>
      {(title || hint) && (
        <div className="form-section-header">
          {title && <h3 className="form-section-title">{title}</h3>}
          {hint && <p className="form-section-hint">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
};

export default FormSection;
