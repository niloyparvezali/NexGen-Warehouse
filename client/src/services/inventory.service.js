import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getInventory = async (page = 1, limit = 10, search = "", lowStockOnly = false, category = "") => {
  const response = await api.get("/inventory", {
    params: {
      page,
      limit,
      search,
      lowStockOnly,
      category,
    },
  });

  return unwrapResponseData(response);
};

export const getInventoryMovements = async (page = 1, limit = 10, search = "", productId = "") => {
  const response = await api.get("/inventory/movements", {
    params: {
      page,
      limit,
      search,
      productId,
    },
  });

  return unwrapResponseData(response);
};

export const adjustInventory = async (data) => {
  const response = await api.post("/inventory/adjust", data);

  return unwrapResponseData(response);
};
