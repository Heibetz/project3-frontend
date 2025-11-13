<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = Utils.getStore("user");
const message = ref("");
const form = ref({
  name: "",
  description: "",
  is_standard: false,
  created_by: user.userId,
  day: null,
  exercises: [],
});
const availableExercises = ref([]);
const selectedExercise = ref(null);
const exerciseConfig = ref({
  sets: 3,
  reps: 10,
  duration: "",
});

const rules = {
  name: [
    (v) => !!v || "Name is required",
    (v) => (v && v.length <= 50) || "Name must be 50 characters or less",
  ],
  description: [
    (v) => !v || (v && v.length <= 200) || "Description must be 200 characters or less",
  ],
};

const loadAvailableExercises = () => {
  ExerciseServices.getAll()
    .then((response) => {
      availableExercises.value = response.data;
    })
    .catch((e) => {
      console.error("Error loading exercises:", e);
    });
};

const addExerciseToForm = () => {
  if (!selectedExercise.value) {
    message.value = "Please select an exercise";
    return;
  }

  form.value.exercises.push({
    exercise_id: selectedExercise.value.exercise_id || selectedExercise.value.id,
    name: selectedExercise.value.name,
    sets: exerciseConfig.value.sets,
    reps: exerciseConfig.value.reps,
    duration: exerciseConfig.value.duration,
  });

  selectedExercise.value = null;
  exerciseConfig.value = { sets: 3, reps: 10, duration: "" };
};

const removeExerciseFromForm = (index) => {
  form.value.exercises.splice(index, 1);
};

const saveExercisePlan = () => {
  ExercisePlanServices.create(form.value)
    .then(() => {
      router.push({ name: "exercisePlans" });
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error creating exercise plan";
    });
};

const cancel = () => {
  router.push({ name: "exercisePlans" });
};

onMounted(() => {
  loadAvailableExercises();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Add Exercise Plan</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card class="mb-6">
        <v-card-title> Create a new Exercise Plan </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="form.name"
              label="Exercise Plan Name"
              :rules="rules.name"
              placeholder="Enter exercise plan name"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="form.description"
              label="Description"
              :rules="rules.description"
              placeholder="Enter exercise plan description"
              variant="outlined"
              class="mb-4"
            ></v-textarea>

            <v-checkbox
              v-model="form.is_standard"
              label="Mark as Standard Plan"
              class="mb-4"
            ></v-checkbox>

            <v-select
              v-model="form.day"
              :items="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']"
              label="Workout Day (Optional)"
              variant="outlined"
              class="mb-4"
              clearable
            ></v-select>

            <v-alert v-if="message" type="error" class="mb-4">
              {{ message }}
            </v-alert>
          </v-form>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title> Add Exercises to Plan </v-card-title>
        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedExercise"
                :items="availableExercises"
                item-title="name"
                return-object
                label="Select Exercise"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model.number="exerciseConfig.sets"
                type="number"
                label="Sets"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model.number="exerciseConfig.reps"
                type="number"
                label="Reps"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="exerciseConfig.duration"
                label="Duration"
                placeholder="e.g., 30s"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-btn color="success" @click="addExerciseToForm" class="mb-4">
            Add Exercise
          </v-btn>

          <v-divider class="mb-4"></v-divider>

          <h3 class="mb-4">Exercises in Plan</h3>
          <v-table v-if="form.exercises.length > 0">
            <thead>
              <tr>
                <th class="text-left">Exercise Name</th>
                <th class="text-left">Sets</th>
                <th class="text-left">Reps</th>
                <th class="text-left">Duration</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exercise, index) in form.exercises" :key="index">
                <td>{{ exercise.name }}</td>
                <td>{{ exercise.sets }}</td>
                <td>{{ exercise.reps }}</td>
                <td>{{ exercise.duration || "-" }}</td>
                <td>
                  <v-icon small class="mx-4" @click="removeExerciseFromForm(index)">
                    mdi-trash-can
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-alert v-else type="info" class="mt-4">
            No exercises added yet. Add exercises to your plan.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-row class="mt-6">
        <v-col>
          <v-btn color="primary" @click="saveExercisePlan">
            Save Exercise Plan
          </v-btn>
        </v-col>
        <v-col>
          <v-btn variant="text" @click="cancel"> Cancel </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped></style>
