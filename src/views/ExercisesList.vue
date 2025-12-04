<script setup>
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils.js";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const exercises = ref([]);
const user = Utils.getStore("user");
const message = ref("Search, Edit or Delete Exercises");

const editExercise = (exercise) => {
  router.push({ name: "editExercise", params: { id: exercise.exercise_id } });
};

const addExercise = () => {
  router.push({ name: "addExercise" });
};

const deleteExercise = (exercise) => {
  ExerciseServices.delete(exercise.exercise_id)
    .then(() => {
      retrieveExercises();
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error deleting exercise";
    });
};

const retrieveExercises = () => {
  ExerciseServices.getAll()
    .then((response) => {
      exercises.value = response.data;
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error loading exercises";
    });
};

retrieveExercises();
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Exercises</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="addExercise">Add Exercise</v-btn>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title> Exercises </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Type</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in exercises" :key="item.exercise_id">
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td>{{ item.type }}</td>
              <td>
                <v-icon small class="mx-4" @click="editExercise(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small class="mx-4" @click="deleteExercise(item)">
                  mdi-trash-can
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
</template>
