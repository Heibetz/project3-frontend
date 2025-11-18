<script setup>
import { ref, onMounted } from "vue";
import Utils from "../config/utils";

const user = ref(null);

onMounted(() => {
  user.value = Utils.getStore("user");
});
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Coach Dashboard</v-toolbar-title>
    </v-toolbar>
    <div v-if="user">
      <h2>Welcome, Coach {{ user.fName }} {{ user.lName }}</h2>
    </div>

    <v-row class="mt-6" dense>
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Athletes</v-card-title>
          <v-card-text>Add athletes and view their profiles.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'users' }">View Athletes</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addUser' }">Add Athlete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Exercises</v-card-title>
          <v-card-text>Add or edit exercises for athletes.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'exercises' }">View Exercises</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addExercise' }">Add Exercise</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Exercise Plans</v-card-title>
          <v-card-text>Create and edit exercise plans.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'exercisePlans' }">View Plans</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addExercisePlan' }">Add Plan</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
