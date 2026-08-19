const parseMoneyValue = (value) => {
  if (value == null || value === "") return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatMoney = (value, { locale = "en-BD", maximumFractionDigits = 2 } = {}) => {
  const amount = parseMoneyValue(value);
  const hasFraction = !Number.isInteger(amount);
  const options = {
    minimumFractionDigits: hasFraction ? maximumFractionDigits : 0,
    maximumFractionDigits,
  };
  return amount.toLocaleString(locale, options);
};

export default {
  formatMoney,
};
