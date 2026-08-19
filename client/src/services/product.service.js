import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

// Get all products
export const getProducts = async (page = 1, limit = 10, search = "", category = "") => {
  const response = await api.get("/products", {
    params: {
      page,
      limit,
      search,
      category,
    },
  });

  return unwrapResponseData(response);
};

// Get single product
export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);

  return unwrapResponseData(response);
};

// Create product
export const createProduct = async (data) => {
  const response = await api.post("/products", data);

  return unwrapResponseData(response);
};

// Update product
export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);

  return unwrapResponseData(response);
};

// Soft delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);

  return unwrapResponseData(response);
};

// Restore product
export const restoreProduct = async (id) => {
  const response = await api.patch(`/products/${id}/restore`);

  return unwrapResponseData(response);
};
