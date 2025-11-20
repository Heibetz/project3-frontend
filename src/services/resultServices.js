import apiClient from "./services.js";

export default {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/results?${query}` : "/results";
    return apiClient.get(path);
  },
  get(id) {
    return apiClient.get(`/results/${id}`);
  },
  create(data) {
    return apiClient.post("/results", data);
  },
  update(id, data) {
    return apiClient.put(`/results/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/results/${id}`);
  },
  getForExercise(exerciseId) {
    return apiClient.get(`/results/for-exercise/${exerciseId}`);
  },
};

