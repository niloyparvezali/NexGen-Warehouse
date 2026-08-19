import api from "../api/axios";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const result = response.data?.data;

  if (!result?.token || !result?.user) {
    throw new Error("Authentication failed: invalid login response.");
  }

  return result;
};
