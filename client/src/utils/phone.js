export const normalizePhoneInput = (value = "") =>
  value.replace(/\D/g, "").slice(0, 11);

export const isValidPhoneNumber = (value = "") => /^\d{11}$/.test(String(value).trim());
