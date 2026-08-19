import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

// Get all categories
export const getCategories = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/categories", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

// Get single category
export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}`);

  return unwrapResponseData(response);
};

// Create category
export const createCategory = async (data) => {
  const response = await api.post("/categories", data);

  return unwrapResponseData(response);
};

// Update category
export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);

  return unwrapResponseData(response);
};

// Soft delete category
export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);

  return unwrapResponseData(response);
};

// Restore category
export const restoreCategory = async (id) => {
  const response = await api.patch(`/categories/${id}/restore`);

  return unwrapResponseData(response);
};
