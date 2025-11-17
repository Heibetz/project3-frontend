<script setup>
import { ref, onMounted } from "vue";
import ResultServices from "../services/resultServices";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(false);
const user = Utils.getStore("user");
const result = ref({
  user_id: null,
  exercise_id: null,
  date: null,
  resultMeasure1: null,
  resultMeasure2: null,
  resultMeasure3: null,
  notes: "",
});
const exercises = ref([]);
const message = ref("Enter data and click save");

const props = defineProps({
  id: {
    required: true,
  },
});

// Fetch all exercises for the dropdown
const fetchExercises = () => {
  ExerciseServices.getAll({ created_by: user.userId })
    .then((response) => {
      exercises.value = response.data;
    })
    .catch((e) => {
      console.error("Error loading exercises:", e);
    });
};

const retrieveResult = async () => {
  try {
    const response = await ResultServices.get(props.id);
    result.value = response.data;
    // Format date for date input (YYYY-MM-DD)
    if (result.value.date) {
      const date = new Date(result.value.date);
      result.value.date = date.toISOString().split("T")[0];
    }
  } catch (e) {
    message.value = e.response?.data?.message || "Error loading result";
  }
};

const updateResult = async () => {
  const data = {
    user_id: result.value.user_id,
    exercise_id: result.value.exercise_id,
    date: result.value.date,
    resultMeasure1: result.value.resultMeasure1 ? parseInt(result.value.resultMeasure1) : null,
    resultMeasure2: result.value.resultMeasure2 ? parseInt(result.value.resultMeasure2) : null,
    resultMeasure3: result.value.resultMeasure3 ? parseInt(result.value.resultMeasure3) : null,
    notes: result.value.notes || null,
  };
  try {
    await ResultServices.update(props.id, data);
    router.push({ name: "results" });
  } catch (e) {
    message.value = e.response?.data?.message || "Error updating result";
  }
};

const cancel = () => {
  router.push({ name: "results" });
};

onMounted(() => {
  fetchExercises();
  retrieveResult();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Edit Result</v-toolbar-title>
      </v-toolbar>
      <br />
      <h4>{{ message }}</h4>
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <v-select
          v-model="result.exercise_id"
          :items="exercises"
          item-title="name"
          item-value="exercise_id"
          label="Exercise"
          required
        ></v-select>

        <v-text-field
          v-model="result.date"
          type="date"
          label="Date"
          required
        ></v-text-field>

        <v-text-field
          v-model.number="result.resultMeasure1"
          type="number"
          label="Measure 1"
          hint="Enter first measurement (e.g., weight, reps, etc.)"
        ></v-text-field>

        <v-text-field
          v-model.number="result.resultMeasure2"
          type="number"
          label="Measure 2"
          hint="Enter second measurement"
        ></v-text-field>

        <v-text-field
          v-model.number="result.resultMeasure3"
          type="number"
          label="Measure 3"
          hint="Enter third measurement"
        ></v-text-field>

        <v-textarea
          v-model="result.notes"
          label="Notes"
          :counter="500"
          rows="3"
        ></v-textarea>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="updateResult()"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel()"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>

