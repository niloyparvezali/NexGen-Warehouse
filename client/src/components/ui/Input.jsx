import { cn } from "../../utils/cn";
import { normalizeIntegerInputValue, normalizeNumberInputValue } from "../../utils/numberInput";

const Input = ({ label, error, className = "", onChange, onFocus, onBlur, type, step, value, ...props }) => {
  const handleChange = (event) => {
    if (type === "number" && event && typeof event.target?.value !== "undefined") {
      const rawValue = event.target.value;
      const normalizedValue =
        step && Number(step) > 0 && !Number.isInteger(Number(step))
          ? normalizeNumberInputValue(rawValue, { step })
          : normalizeIntegerInputValue(rawValue, "");

      if (typeof onChange === "function") {
        onChange({ ...event, target: { ...event.target, value: normalizedValue } });
      } else {
        event.target.value = normalizedValue;
      }
      return;
    }

    onChange?.(event);
  };

  const handleFocus = (event) => {
    if (type === "number" && event.currentTarget.value === "0" && typeof onChange === "function") {
      onChange({ ...event, target: { ...event.target, value: "" } });
    }
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    if (type === "number" && event.currentTarget.value === "" && typeof onChange === "function") {
      onChange({ ...event, target: { ...event.target, value: "0" } });
    }
    onBlur?.(event);
  };

  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        step={step}
        value={value}
        className={cn("form-control", className)}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <p className="wc-form-error">{error}</p>}
    </div>
  );
};

export default Input;
