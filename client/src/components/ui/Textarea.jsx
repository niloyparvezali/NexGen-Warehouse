import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Textarea = forwardRef(function Textarea(
  { label, error, className = "", ...props },
  ref,
) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <textarea ref={ref} className={cn("textarea-field", className)} {...props} />
      {error && <p className="wc-form-error">{error}</p>}
    </div>
  );
});

export default Textarea;
