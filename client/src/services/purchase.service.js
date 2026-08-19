import api from "../api/axios";

const unwrapResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getPurchases = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/purchases", {
    params: {
      page,
      limit,
      search,
    },
  });

  return unwrapResponseData(response);
};

export const getPurchase = async (id) => {
  const response = await api.get(`/purchases/${id}`);

  return unwrapResponseData(response);
};

const buildPurchasePayload = (data = {}) => {
  if (data?.attachment instanceof File) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value == null) return;

      if (key === "items") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      if (key === "attachment") {
        formData.append(key, value);
        return;
      }

      formData.append(key, value);
    });

    return formData;
  }

  return data;
};

export const createPurchase = async (data) => {
  const payload = buildPurchasePayload(data);
  const response = await api.post("/purchases", payload, {
    headers: payload instanceof FormData ? undefined : { "Content-Type": "application/json" },
  });

  return unwrapResponseData(response);
};

export const updatePurchase = async (id, data) => {
  const payload = buildPurchasePayload(data);
  const response = await api.put(`/purchases/${id}`, payload, {
    headers: payload instanceof FormData ? undefined : { "Content-Type": "application/json" },
  });

  return unwrapResponseData(response);
};

export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/${id}`);

  return unwrapResponseData(response);
};

export const restorePurchase = async (id) => {
  const response = await api.patch(`/purchases/${id}/restore`);

  return unwrapResponseData(response);
};

export const updatePurchaseStatus = async (id, status) => {
  const response = await api.patch(`/purchases/${id}/status`, { status });

  return unwrapResponseData(response);
};
