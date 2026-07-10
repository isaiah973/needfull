import api from "./axios";
export const registerUser = async (userData) => {
  const { data } = await api.post("/users/register", userData);
  return data;
};

export const loginUser = async (userData) => {
  const { data } = await api.post("/users/login", userData);
  return data;
};

export const verifyEmail = async (verificationData) => {
  const { data } = await api.post("/users/verify-email", verificationData);

  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/users/logout");
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  return data;
};
