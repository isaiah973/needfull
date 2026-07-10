import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const getItems = async () => {
  const res = await axios.get(`${API}/items`);

  return res.data.items;
};
