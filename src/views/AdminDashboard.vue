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
      <v-toolbar-title>Admin Dashboard</v-toolbar-title>
    </v-toolbar>
    <div v-if="user">
      <h2>Welcome, Admin {{ user.fName }} {{ user.lName }}</h2>
    </div>

    <v-row class="mt-6" dense>
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Users</v-card-title>
          <v-card-text>Manage all users in the system.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'users' }">View Users</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addUser' }">Add User</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Exercises</v-card-title>
          <v-card-text>Add or edit standard exercises.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'exercises' }">View Exercises</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addExercise' }">Add Exercise</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Exercise Plans</v-card-title>
          <v-card-text>Create and edit standard exercise plans.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'exercisePlans' }">View Plans</v-btn>
            <v-btn color="secondary" variant="outlined" :to="{ name: 'addExercisePlan' }">Add Plan</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
