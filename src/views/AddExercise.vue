<script setup>
import { ref } from "vue";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(false);
const user = Utils.getStore("user");
const exercise = ref({
  name: "",
  description: "",
  type: "Standard",
});
const message = ref("Enter data and click save");

const saveExercise = () => {
  const data = {
    name: exercise.value.name,
    description: exercise.value.description,
    type: exercise.value.type,
    created_by: user.userId,
  };
  ExerciseServices.create(data)
    .then((response) => {
      router.push({ name: "exercises" });
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error creating exercise";
    });
};

const cancel = () => {
  router.push({ name: "exercises" });
};
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Exercise Add</v-toolbar-title>
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

        <v-btn :disabled="!valid" color="success" class="mr-4" @click="saveExercise()">
          Save
        </v-btn>

        <v-btn color="error" class="mr-4" @click="cancel()"> Cancel </v-btn>
      </v-form>
    </v-container>
  </div>
</template>
