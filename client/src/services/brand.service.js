import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

// Get all brands
export const getBrands = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/brands", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

// Get single brand
export const getBrand = async (id) => {
  const response = await api.get(`/brands/${id}`);

  return unwrapResponseData(response);
};

// Create brand
export const createBrand = async (data) => {
  const response = await api.post("/brands", data);

  return unwrapResponseData(response);
};

// Update brand
export const updateBrand = async (id, data) => {
  const response = await api.put(`/brands/${id}`, data);

  return unwrapResponseData(response);
};

// Soft delete brand
export const deleteBrand = async (id) => {
  const response = await api.delete(`/brands/${id}`);

  return unwrapResponseData(response);
};

// Restore brand
export const restoreBrand = async (id) => {
  const response = await api.patch(`/brands/${id}/restore`);

  return unwrapResponseData(response);
};
