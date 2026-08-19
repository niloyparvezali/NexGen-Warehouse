import api from "../api/axios";

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const getSales = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/sales", {
    params: { page, limit, search },
  });

  return unwrap(response);
};

export const getSale = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return unwrap(response);
};

export const createSale = async (data) => {
  const response = await api.post("/sales", data);
  return unwrap(response);
};

export const deleteSale = async (id) => {
  const response = await api.delete(`/sales/${id}`);
  return unwrap(response);
};

export const restoreSale = async (id) => {
  const response = await api.patch(`/sales/${id}/restore`);
  return unwrap(response);
};

export const createSaleReturn = async (saleId, data) => {
  const response = await api.post(`/sales/${saleId}/returns`, data);
  return unwrap(response);
};

export const updateSaleStatus = async (id, status) => {
  const response = await api.patch(`/sales/${id}/status`, { status });
  return unwrap(response);
};

export default {
  getSales,
  getSale,
  createSale,
  createSaleReturn,
  deleteSale,
  restoreSale,
  updateSaleStatus,
};
