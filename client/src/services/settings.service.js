import api from "../api/axios";

export const getSettings = async () => {
  const response = await api.get("/settings/company");
  return response.data;
};

export const updateSettings = async (payload) => {
  const response = await api.put("/settings/company", payload);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/settings/roles");
  return response.data;
};

export const createRole = async (payload) => {
  const response = await api.post("/settings/roles", payload);
  return response.data;
};

export const updateRole = async (id, payload) => {
  const response = await api.put(`/settings/roles/${id}`, payload);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/settings/roles/${id}`);
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/settings/users");
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post("/settings/users", payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.put(`/settings/users/${id}`, payload);
  return response.data;
};

export const toggleUserStatus = async (id, isActive) => {
  const response = await api.patch(`/settings/users/${id}/status`, { is_active: isActive });
  return response.data;
};

export const resetUserPassword = async (id, password) => {
  const response = await api.post(`/settings/users/${id}/reset-password`, { password });
  return response.data;
};

export const changePassword = async (password) => {
  const response = await api.post("/settings/change-password", { password });
  return response.data;
};

export const assignUserRole = async (id, roleId) => {
  const response = await api.post(`/settings/users/${id}/assign-role`, { role_id: roleId });
  return response.data;
};

export const resetUserData = async () => {
  const response = await api.post("/settings/reset-user-data");
  return response.data;
};

export const resetStockData = async () => {
  const response = await api.post("/settings/reset-stock-data");
  return response.data;
};

export const resetSalesData = async () => {
  const response = await api.post("/settings/reset-sales-data");
  return response.data;
};

export const resetPurchasesData = async () => {
  const response = await api.post("/settings/reset-purchases-data");
  return response.data;
};

export const resetExpensesData = async () => {
  const response = await api.post("/settings/reset-expenses-data");
  return response.data;
};

export const resetReturnsData = async () => {
  const response = await api.post("/settings/reset-returns-data");
  return response.data;
};

export const resetReportsData = async () => {
  const response = await api.post("/settings/reset-reports-data");
  return response.data;
};

export const resetCustomerData = async () => {
  const response = await api.post("/settings/reset-customer-data");
  return response.data;
};

export const resetSupplierData = async () => {
  const response = await api.post("/settings/reset-supplier-data");
  return response.data;
};

export const backupDatabase = async () => {
  const response = await api.post("/settings/backup");
  return response.data;
};

export const restoreDatabase = async (filePath) => {
  const response = await api.post("/settings/restore", { filePath });
  return response.data;
};

export const getBackupHistory = async () => {
  const response = await api.get("/settings/backups");
  return response.data;
};
