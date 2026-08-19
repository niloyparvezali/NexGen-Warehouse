import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

// Get all units
export const getUnits = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/units", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

// Get single unit
export const getUnit = async (id) => {
  const response = await api.get(`/units/${id}`);

  return unwrapResponseData(response);
};

// Create unit
export const createUnit = async (data) => {
  const response = await api.post("/units", data);

  return unwrapResponseData(response);
};

// Update unit
export const updateUnit = async (id, data) => {
  const response = await api.put(`/units/${id}`, data);

  return unwrapResponseData(response);
};

// Soft delete unit
export const deleteUnit = async (id) => {
  const response = await api.delete(`/units/${id}`);

  return unwrapResponseData(response);
};

// Restore unit
export const restoreUnit = async (id) => {
  const response = await api.patch(`/units/${id}/restore`);

  return unwrapResponseData(response);
};
