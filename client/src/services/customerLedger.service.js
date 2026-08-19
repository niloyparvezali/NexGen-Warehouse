import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getCustomerLedger = async (customerId) => {
  const response = await api.get(`/customer-ledger/${customerId}`);
  return unwrapResponseData(response);
};

export default {
  getCustomerLedger,
};
