import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getExpenseCategories = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/expense-categories", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

export const getExpenseCategory = async (id) => {
  const response = await api.get(`/expense-categories/${id}`);

  return unwrapResponseData(response);
};

export const createExpenseCategory = async (data) => {
  const response = await api.post("/expense-categories", data);

  return unwrapResponseData(response);
};

export const updateExpenseCategory = async (id, data) => {
  const response = await api.put(`/expense-categories/${id}`, data);

  return unwrapResponseData(response);
};

export const deleteExpenseCategory = async (id) => {
  const response = await api.delete(`/expense-categories/${id}`);

  return unwrapResponseData(response);
};

export const restoreExpenseCategory = async (id) => {
  const response = await api.patch(`/expense-categories/${id}/restore`);

  return unwrapResponseData(response);
};
