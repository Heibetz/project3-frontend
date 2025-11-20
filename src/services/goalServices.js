import apiClient from "./services.js";

export default {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/goals?${query}` : "/goals";
    return apiClient.get(path);
  },
  get(id) {
    return apiClient.get(`/goals/${id}`);
  },
  create(data) {
    return apiClient.post("/goals", data);
  },
  update(id, data) {
    return apiClient.put(`/goals/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/goals/${id}`);
  },
};
