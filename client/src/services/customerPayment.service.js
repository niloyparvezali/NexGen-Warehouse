import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getCustomerPayments = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/customer-payments", {
    params: { page, limit, search },
  });

  return unwrapResponseData(response);
};

export const createCustomerPayment = async (data) => {
  const response = await api.post("/customer-payments", data);

  return unwrapResponseData(response);
};

export const getCustomerDueSummary = async (customerId) => {
  const response = await api.get(`/customer-payments/customer/${customerId}/due`);

  return unwrapResponseData(response);
};

export default {
  getCustomerPayments,
  createCustomerPayment,
  getCustomerDueSummary,
};
