import apiClient from "./services.js";

export default {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/exercise-plans?${query}` : "/exercise-plans";
    return apiClient.get(path);
  },
  get(id) {
    return apiClient.get(`/exercise-plans/${id}`);
  },
  create(data) {
    return apiClient.post("/exercise-plans", data);
  },
  update(id, data) {
    return apiClient.put(`/exercise-plans/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/exercise-plans/${id}`);
  },
  addExercise(planId, exerciseData) {
    return apiClient.post(`/exercise-plans/${planId}/exercises`, exerciseData);
  },
  removeExercise(planId, exerciseId) {
    return apiClient.delete(`/exercise-plans/${planId}/exercises/${exerciseId}`);
  },
};

