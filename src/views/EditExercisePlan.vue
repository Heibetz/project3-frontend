<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import ExerciseServices from "../services/exerciseServices";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const message = ref("");
const form = ref({
  name: "",
  description: "",
  is_standard: false,
  day: null,
});
const exercises = ref([]);
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

const loadExercisePlan = () => {
  ExercisePlanServices.get(route.params.id)
    .then((response) => {
      form.value = response.data;
      exercises.value = response.data.exercises || [];
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error loading exercise plan";
    });
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

const updateExercisePlan = () => {
  ExercisePlanServices.update(route.params.id, form.value)
    .then(() => {
      router.push({ name: "exercisePlans" });
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error updating exercise plan";
    });
};

const addExerciseToPlan = () => {
  if (!selectedExercise.value) {
    message.value = "Please select an exercise";
    return;
  }

  const exerciseData = {
    exercise_id: selectedExercise.value.exercise_id || selectedExercise.value.id,
    sets: exerciseConfig.value.sets,
    reps: exerciseConfig.value.reps,
    duration: exerciseConfig.value.duration,
  };

  ExercisePlanServices.addExercise(route.params.id, exerciseData)
    .then(() => {
      exercises.value.push({
        ...selectedExercise.value,
        exercisePlanExercise: {
          sets: exerciseConfig.value.sets,
          reps: exerciseConfig.value.reps,
          duration: exerciseConfig.value.duration,
        },
      });
      selectedExercise.value = null;
      exerciseConfig.value = { sets: 3, reps: 10, duration: "" };
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error adding exercise to plan";
    });
};

const removeExerciseFromPlan = (exercise) => {
  ExercisePlanServices.removeExercise(
    route.params.id,
    exercise.exercise_id || exercise.id
  )
    .then(() => {
      exercises.value = exercises.value.filter(
        (ex) => (ex.exercise_id || ex.id) !== (exercise.exercise_id || exercise.id)
      );
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error removing exercise from plan";
    });
};

const cancel = () => {
  router.push({ name: "exercisePlans" });
};

onMounted(() => {
  loadExercisePlan();
  loadAvailableExercises();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Edit Exercise Plan</v-toolbar-title>
      </v-toolbar>
      <br /><br />
      <v-card class="mb-6">
        <v-card-title> Edit Exercise Plan </v-card-title>
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

            <v-row>
              <v-col>
                <v-btn color="primary" @click="updateExercisePlan">
                  Update Exercise Plan
                </v-btn>
              </v-col>
              <v-col>
                <v-btn variant="text" @click="cancel"> Cancel </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title> Manage Exercises in Plan </v-card-title>
        <v-card-text>
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-select
                v-model="selectedExercise"
                :items="availableExercises"
                item-title="name"
                item-value="exercise_id"
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
          <v-btn color="success" @click="addExerciseToPlan" class="mb-4">
            Add Exercise
          </v-btn>

          <v-divider class="mb-4"></v-divider>

          <h3 class="mb-4">Exercises in Plan</h3>
          <v-table>
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
              <tr v-for="exercise in exercises" :key="exercise.exercise_id || exercise.id">
                <td>{{ exercise.name }}</td>
                <td>
                  {{
                    exercise.exercisePlanExercise?.sets || exercise.sets || "-"
                  }}
                </td>
                <td>
                  {{
                    exercise.exercisePlanExercise?.reps || exercise.reps || "-"
                  }}
                </td>
                <td>
                  {{
                    exercise.exercisePlanExercise?.duration || exercise.duration || "-"
                  }}
                </td>
                <td>
                  <v-icon
                    small
                    class="mx-4"
                    @click="removeExerciseFromPlan(exercise)"
                  >
                    mdi-trash-can
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped></style>
