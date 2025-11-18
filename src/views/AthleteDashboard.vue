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
      <v-toolbar-title>Athlete Dashboard</v-toolbar-title>
    </v-toolbar>
    <div v-if="user">
      <h2>Welcome, {{ user.fName }} {{ user.lName }}</h2>
    </div>

    <v-row class="mt-6" dense>
      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Edit Profile</v-card-title>
          <v-card-text>Update your personal information.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'editProfile' }">Go</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>Today's Workout</v-card-title>
          <v-card-text>View your assigned workout for today.</v-card-text>
          <v-card-actions>
            <v-btn color="primary" :to="{ name: 'workout' }">Open</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
