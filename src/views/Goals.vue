<template>
  <v-container>
    <h2>Goals</h2>
    <v-card class="pa-4 mb-6">
      <v-form @submit.prevent="saveGoal">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              label="Exercise"
              :items="exerciseOptions"
              item-title="name"
              item-value="exercise_id"
              v-model="form.exercise_id"
              :loading="loadingExercises"
              :disabled="loadingExercises"
              required
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              label="Current Weight (lbs)"
              type="number"
              v-model.number="form.currentWeight"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              label="Goal Weight (lbs)"
              type="number"
              v-model.number="form.goalWeight"
            />
          </v-col>
        </v-row>
        <v-btn color="primary" type="submit">Add Goal</v-btn>
      </v-form>
    </v-card>

    <v-card>
      <v-card-title>Existing Goals</v-card-title>
      <v-card-text>
        <div style="max-height: 300px; overflow-y: auto;">
          <template v-if="!loadingGoals && (!goals || goals.length === 0)">
            <v-alert type="info" variant="tonal">No goals yet. Add your first goal above.</v-alert>
          </template>
          <template v-else>
            <v-list>
              <v-list-item v-for="g in goals" :key="g.id">
                <v-list-item-title>
                  {{ exerciseName(g.exercise_id) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Current: {{ g.currentWeight }} lbs · Goal: {{ g.goalWeight }} lbs
                </v-list-item-subtitle>
                <template #append>
                  <v-btn size="small" variant="text" @click="editGoal(g)">Edit</v-btn>
                  <v-btn size="small" variant="text" color="error" @click="removeGoal(g)">Delete</v-btn>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import goalServices from "../services/goalServices.js";
import exerciseServices from "../services/exerciseServices.js";

export default {
  name: "Goals",
  data() {
    return {
      form: {
        exercise_id: null,
        currentWeight: null,
        goalWeight: null,
      },
      editingId: null,
      goals: [],
      exercises: [],
      loadingExercises: false,
      loadingGoals: false,
      headers: [
        { title: "Exercise", key: "exercise_id" },
        { title: "Weight", key: "currentWeight" },
        { title: "Goal", key: "goalWeight" },
        { title: "Actions", key: "actions", sortable: false },
      ],
    };
  },
  computed: {
    exerciseOptions() {
      return this.exercises;
    },
  },
  methods: {
    async loadExercises() {
      this.loadingExercises = true;
      try {
        const { data } = await exerciseServices.getAll();
        this.exercises = data;
      } finally {
        this.loadingExercises = false;
      }
    },
    async loadGoals() {
      this.loadingGoals = true;
      try {
        const { data } = await goalServices.getAll();
        this.goals = Array.isArray(data) ? data : (data?.data ?? []);
      } finally {
        this.loadingGoals = false;
      }
    },
    exerciseName(id) {
      const ex = this.exercises.find((e) => e.exercise_id === id);
      return ex ? ex.name : id;
    },
    async saveGoal() {
      const payload = { ...this.form };
      if (!payload.exercise_id) return;
      if (this.editingId) {
        await goalServices.update(this.editingId, payload);
      } else {
        await goalServices.create(payload);
      }
      this.editingId = null;
      this.form = { exercise_id: null, currentWeight: null, goalWeight: null };
      await this.loadGoals();
    },
    editGoal(item) {
      this.editingId = item.id;
      this.form = {
        exercise_id: item.exercise_id,
        currentWeight: item.currentWeight,
        goalWeight: item.goalWeight,
      };
    },
    async removeGoal(item) {
      await goalServices.delete(item.id);
      await this.loadGoals();
    },
  },
  async mounted() {
    await Promise.all([this.loadExercises(), this.loadGoals()]);
  },
};
</script>
