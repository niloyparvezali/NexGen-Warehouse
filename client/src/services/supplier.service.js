import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getSuppliers = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/suppliers", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

export const getSupplier = async (id) => {
  const response = await api.get(`/suppliers/${id}`);

  return unwrapResponseData(response);
};

export const createSupplier = async (data) => {
  const response = await api.post("/suppliers", data);

  return unwrapResponseData(response);
};

export const updateSupplier = async (id, data) => {
  const response = await api.put(`/suppliers/${id}`, data);

  return unwrapResponseData(response);
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);

  return unwrapResponseData(response);
};

export const restoreSupplier = async (id) => {
  const response = await api.patch(`/suppliers/${id}/restore`);

  return unwrapResponseData(response);
};
