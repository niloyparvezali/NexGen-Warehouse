import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getExpenses = async (
  page = 1,
  limit = 10,
  search = "",
  category = "",
  startDate = "",
  endDate = "",
) => {
  const response = await api.get("/expenses", {
    params: {
      page,
      limit,
      search,
      category,
      startDate,
      endDate,
    },
  });

  return unwrapResponseData(response);
};

export const getExpense = async (id) => {
  const response = await api.get(`/expenses/${id}`);

  return unwrapResponseData(response);
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses", data);

  return unwrapResponseData(response);
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);

  return unwrapResponseData(response);
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);

  return unwrapResponseData(response);
};

export const restoreExpense = async (id) => {
  const response = await api.patch(`/expenses/${id}/restore`);

  return unwrapResponseData(response);
};
