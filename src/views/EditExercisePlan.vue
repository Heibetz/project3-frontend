<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import ExerciseServices from "../services/exerciseServices";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const message = ref("");
const messageType = ref("error");
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
const editingExercise = ref(null);

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
      messageType.value = "error";
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
      messageType.value = "error";
    });
};

const addExerciseToPlan = () => {
  if (!selectedExercise.value) {
    message.value = "Please select an exercise";
    return;
  }

  console.log("Selected exercise:", selectedExercise.value);
  
  const exerciseData = {
    exercise_id: selectedExercise.value.exercise_id || selectedExercise.value.id,
    sets: exerciseConfig.value.sets,
    reps: exerciseConfig.value.reps,
    duration: exerciseConfig.value.duration,
  };

  console.log("Exercise data to send:", exerciseData);

  ExercisePlanServices.addExercise(route.params.id, exerciseData)
    .then((response) => {
      console.log("Exercise added successfully:", response.data);
      message.value = "Exercise added successfully!";
      messageType.value = "success";
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
      console.error("Error adding exercise:", e);
      console.error("Error response:", e.response?.data);
      message.value = e.response?.data?.message || "Error adding exercise to plan";
      messageType.value = "error";
    });
};

const removeExerciseFromPlan = (exercise) => {
  ExercisePlanServices.removeExercise(
    route.params.id,
    exercise.exercise_id || exercise.id
  )
    .then(() => {
      exercises.value = exercises.value.filter(
        (e) => (e.exercise_id || e.id) !== (exercise.exercise_id || exercise.id)
      );
      message.value = "Exercise removed successfully!";
      messageType.value = "success";
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error removing exercise from plan";
      messageType.value = "error";
    });
};

const startEditingExercise = (exercise) => {
  editingExercise.value = {
    exercise_id: exercise.exercise_id || exercise.id,
    sets: exercise.exercisePlanExercise?.sets || exercise.sets || 3,
    reps: exercise.exercisePlanExercise?.reps || exercise.reps || 10,
    duration: exercise.exercisePlanExercise?.duration || exercise.duration || "",
  };
};

const saveExerciseChanges = () => {
  const exerciseId = editingExercise.value.exercise_id;
  const updateData = {
    sets: editingExercise.value.sets,
    reps: editingExercise.value.reps,
    duration: editingExercise.value.duration,
  };

  ExercisePlanServices.updateExercise(route.params.id, exerciseId, updateData)
    .then(() => {
      // Update the local exercise data
      const exercise = exercises.value.find(
        (e) => (e.exercise_id || e.id) === exerciseId
      );
      if (exercise) {
        if (!exercise.exercisePlanExercise) {
          exercise.exercisePlanExercise = {};
        }
        exercise.exercisePlanExercise.sets = editingExercise.value.sets;
        exercise.exercisePlanExercise.reps = editingExercise.value.reps;
        exercise.exercisePlanExercise.duration = editingExercise.value.duration;
      }
      message.value = "Exercise updated successfully!";
      messageType.value = "success";
      editingExercise.value = null;
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error updating exercise";
      messageType.value = "error";
    });
};

const cancelEditing = () => {
  editingExercise.value = null;
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

            <v-alert v-if="message" :type="messageType" class="mb-4">
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
          <v-btn color="success" @click="addExerciseToPlan" class="mb-4">
            Add Exercise
          </v-btn>

          <v-divider class="mb-4"></v-divider>

          <h3 class="mb-4">Exercises in Plan</h3>
          
          <div v-if="exercises.length === 0">
            <v-alert type="info" variant="tonal">
              No exercises in this plan yet. Add exercises above.
            </v-alert>
          </div>

          <div v-else class="d-flex flex-column ga-3">
            <v-card
              v-for="exercise in exercises"
              :key="exercise.exercise_id || exercise.id"
              variant="outlined"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-3">
                  <h4>{{ exercise.name }}</h4>
                  <div>
                    <v-btn
                      v-if="!editingExercise || editingExercise.exercise_id !== (exercise.exercise_id || exercise.id)"
                      icon
                      size="small"
                      color="primary"
                      @click="startEditingExercise(exercise)"
                      class="mr-2"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="editingExercise && editingExercise.exercise_id === (exercise.exercise_id || exercise.id)"
                      icon
                      size="small"
                      color="success"
                      @click="saveExerciseChanges"
                      class="mr-2"
                    >
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="editingExercise && editingExercise.exercise_id === (exercise.exercise_id || exercise.id)"
                      icon
                      size="small"
                      color="warning"
                      @click="cancelEditing"
                      class="mr-2"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="removeExerciseFromPlan(exercise)"
                    >
                      <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- View Mode -->
                <div v-if="!editingExercise || editingExercise.exercise_id !== (exercise.exercise_id || exercise.id)">
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip size="small" color="primary" variant="outlined">
                      Sets: {{ exercise.exercisePlanExercise?.sets || exercise.sets || "-" }}
                    </v-chip>
                    <v-chip size="small" color="primary" variant="outlined">
                      Reps: {{ exercise.exercisePlanExercise?.reps || exercise.reps || "-" }}
                    </v-chip>
                    <v-chip size="small" color="info" variant="outlined">
                      Duration: {{ exercise.exercisePlanExercise?.duration || exercise.duration || "No time limit" }}
                    </v-chip>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-else>
                  <v-row>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="editingExercise.sets"
                        type="number"
                        label="Sets"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model.number="editingExercise.reps"
                        type="number"
                        label="Reps"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="editingExercise.duration"
                        label="Duration"
                        placeholder="e.g., 30s"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped></style>
