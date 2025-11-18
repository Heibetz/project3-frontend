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
  </v-container>
</template>
