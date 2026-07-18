import api from "./axios";

// Get all available items
export const getItems = async (filters = {}) => {
  const { data } = await api.get("/items", {
    params: filters,
  });

  return Array.isArray(data) ? data : (data.items ?? []);
};

// Create a new item
export const createItem = async ({ itemData, images }) => {
  const payload = new FormData();

  payload.append("title", itemData.title.trim());
  payload.append("description", itemData.description.trim());
  payload.append("category", itemData.category);
  payload.append("condition", itemData.condition);
  payload.append("location", itemData.location.trim());

  images.forEach((image) => {
    payload.append("images", image.file);
  });

  const { data } = await api.post("/items/create", payload);

  return data;
};
