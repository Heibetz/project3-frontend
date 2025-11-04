<script setup>
import { ref, onMounted } from "vue";
import ExerciseServices from "../services/exerciseServices";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(false);
const exercise = ref({});
const message = ref("Enter data and click save");

const props = defineProps({
  id: {
    required: true,
  },
});

const retrieveExercise = async () => {
  try {
    const response = await ExerciseServices.get(props.id);
    exercise.value = response.data;
  } catch (e) {
    message.value = e.response?.data?.message || "Error loading exercise";
  }
};

const updateExercise = async () => {
  const data = {
    name: exercise.value.name,
    description: exercise.value.description,
    type: exercise.value.type,
  };
  try {
    await ExerciseServices.update(props.id, data);
    router.push({ name: "exercises" });
  } catch (e) {
    message.value = e.response?.data?.message || "Error updating exercise";
  }
};

const cancel = () => {
  router.push({ name: "exercises" });
};

onMounted(() => {
  retrieveExercise();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Exercise Edit</v-toolbar-title>
      </v-toolbar>
      <br />
      <h4>{{ message }}</h4>
      <br />
      <v-form ref="form" v-model="valid" lazy validation>
        <v-text-field
          v-model="exercise.name"
          id="name"
          :counter="50"
          label="Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="exercise.description"
          id="description"
          :counter="200"
          label="Description"
        ></v-text-field>
        <v-select
          v-model="exercise.type"
          :items="['Standard','Custom']"
          label="Type"
          required
        ></v-select>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="updateExercise()"
        >
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel()"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>
