export const normalizeIntegerInputValue = (rawValue, fallback = "") => {
  if (rawValue === undefined || rawValue === null) {
    return fallback;
  }

  const value = String(rawValue).trim();

  if (!value || value === "-" || value === "." || value === "-.") {
    return fallback;
  }

  const sign = value.startsWith("-") ? "-" : "";
  const unsignedValue = sign ? value.slice(1) : value;
  const firstDecimalIndex = unsignedValue.indexOf(".");
  const integerPortion =
    firstDecimalIndex >= 0 ? unsignedValue.slice(0, firstDecimalIndex) : unsignedValue;
  const sanitizedDigits = integerPortion.replace(/[^\d]/g, "");

  if (!sanitizedDigits) {
    return fallback;
  }

  const normalizedDigits = sanitizedDigits.replace(/^0+(?=\d)/, "");
  const normalized = `${sign}${normalizedDigits || "0"}`;

  return normalized === "-0" ? "0" : normalized;
};

export const normalizeNumberInputValue = (rawValue, { step } = {}) => {
  if (rawValue === undefined || rawValue === null) {
    return "";
  }

  const value = String(rawValue).trim();

  if (!value) {
    return "";
  }

  const allowDecimal =
    typeof step === "string"
      ? step.trim() !== "" && Number(step) > 0 && !Number.isInteger(Number(step))
      : false;

  if (!allowDecimal) {
    return normalizeIntegerInputValue(value, "");
  }

  if (value === ".") {
    return "0.";
  }

  const sanitized = value.replace(/[^\d.\-]/g, "");
  const [wholePart, fractionalPart] = sanitized.split(".");
  const cleanedWholePart = (wholePart || "").replace(/^0+(?=\d)/, "") || "0";
  const cleanedFractionalPart = fractionalPart ? fractionalPart.replace(/\.+/g, "") : "";

  if (!fractionalPart) {
    return cleanedWholePart;
  }

  return `${cleanedWholePart}.${cleanedFractionalPart}`;
};

export const toIntegerValue = (rawValue, fallback = 0) => {
  const normalized = normalizeIntegerInputValue(rawValue, String(fallback));
  const value = Number(normalized);
  return Number.isFinite(value) ? value : Number(fallback);
};
export const clearZeroOnFocus = (event, onChange) => {
  if (event?.target?.value === "0" && typeof onChange === "function") {
    onChange({ ...event, target: { ...event.target, value: "" } });
  }
};

export const restoreZeroOnBlur = (event, onChange) => {
  if (event?.target?.value === "" && typeof onChange === "function") {
    onChange({ ...event, target: { ...event.target, value: "0" } });
  }
};

