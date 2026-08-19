import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getSupplierPayments = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/supplier-payments", {
    params: { page, limit, search },
  });

  return unwrapResponseData(response);
};

export const createSupplierPayment = async (data) => {
  const response = await api.post("/supplier-payments", data);

  return unwrapResponseData(response);
};

export const getSupplierDueSummary = async (supplierId) => {
  const response = await api.get(`/supplier-payments/supplier/${supplierId}/due`);

  return unwrapResponseData(response);
};

export default {
  getSupplierPayments,
  createSupplierPayment,
  getSupplierDueSummary,
};
