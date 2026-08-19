import api from "../api/axios";

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const getSalesReport = async (filters = {}) => {
  const response = await api.get("/reports/sales", { params: filters });
  return unwrap(response);
};

export const getPurchaseReport = async (filters = {}) => {
  const response = await api.get("/reports/purchases", { params: filters });
  return unwrap(response);
};

export const getInventoryReport = async (filters = {}) => {
  const response = await api.get("/reports/inventory", { params: filters });
  return unwrap(response);
};

export const getProfitLossReport = async (filters = {}) => {
  const response = await api.get("/reports/profit-loss", { params: filters });
  return unwrap(response);
};

export const getCustomerLedgerReport = async (customerId) => {
  const response = await api.get(`/reports/customer-ledger/${customerId}`);
  return unwrap(response);
};

export const getSupplierLedgerReport = async (supplierId) => {
  const response = await api.get(`/reports/supplier-ledger/${supplierId}`);
  return unwrap(response);
};

export const getSupplierReport = async (filters = {}) => {
  const response = await api.get("/reports/suppliers", { params: filters });
  return unwrap(response);
};

export const getCustomerReport = async (filters = {}) => {
  const response = await api.get("/reports/customers", { params: filters });
  return unwrap(response);
};

export const getExpenseReport = async (filters = {}) => {
  const response = await api.get("/reports/expenses", { params: filters });
  return unwrap(response);
};

export const getStockMovementReport = async (filters = {}) => {
  const response = await api.get("/reports/stock-movements", {
    params: filters,
  });
  return unwrap(response);
};

export const getLowStockReport = async (filters = {}) => {
  const response = await api.get("/reports/low-stock", { params: filters });
  return unwrap(response);
};

export default {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
  getCustomerLedgerReport,
  getSupplierLedgerReport,
  getSupplierReport,
  getCustomerReport,
  getExpenseReport,
  getStockMovementReport,
  getLowStockReport,
};
