import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getCustomers = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/customers", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

export const getCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`);

  return unwrapResponseData(response);
};

export const createCustomer = async (data) => {
  const response = await api.post("/customers", data);

  return unwrapResponseData(response);
};

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);

  return unwrapResponseData(response);
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);

  return unwrapResponseData(response);
};

export const restoreCustomer = async (id) => {
  const response = await api.patch(`/customers/${id}/restore`);

  return unwrapResponseData(response);
};

export default {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
};
