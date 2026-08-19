import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getSupplierLedger = async (supplierId) => {
  const response = await api.get(`/supplier-ledger/${supplierId}`);
  return unwrapResponseData(response);
};

export default {
  getSupplierLedger,
};
