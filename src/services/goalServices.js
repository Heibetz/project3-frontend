import apiClient from "./services.js";

export default {
  create(data) {
    return apiClient.post("/goals", data);
  },
  getAll() {
    return apiClient.get("/goals");
  },
  get(id) {
    return apiClient.get(`/goals/${id}`);
  },
  update(id, data) {
    return apiClient.put(`/goals/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/goals/${id}`);
  },
};