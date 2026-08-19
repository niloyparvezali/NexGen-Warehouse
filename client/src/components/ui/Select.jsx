import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Select = forwardRef(function Select(
  { label, error, className = "", options = [], placeholder = "Select an option", ...props },
  ref,
) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <select ref={ref} className={cn("form-control select-field", className)} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="wc-form-error">{error}</p>}
    </div>
  );
});

export default Select;
