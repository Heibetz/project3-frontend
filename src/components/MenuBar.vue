<script setup>
import ocLogo from "/oc-logo-white.png";
import { ref, onMounted, watch } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const user = ref(null);
const title = ref("Exercises");
const initials = ref("");
const name = ref("");
const logoURL = ref("");

const resetMenu = () => {
  user.value = null;
  user.value = Utils.getStore("user");
  if (user.value) {
    // Safety check for undefined fName/lName
    const firstName = user.value.fName || "";
    const lastName = user.value.lName || "";
    initials.value = (firstName[0] || "") + (lastName[0] || "");
    name.value = firstName + " " + lastName;
  }
};

const logout = () => {
  AuthServices.logoutUser(user.value)
    .then((response) => {
      
      Utils.removeItem("user");
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

onMounted(() => {
  logoURL.value = ocLogo;
  resetMenu();
});

// Watch for route changes to refresh menu
watch(() => route.path, () => {
  resetMenu();
});
</script>

<template>
  <div>
    <v-app-bar app>
      <router-link :to="{ name: 'login' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          cover
          @error="logoURL = ''"
        ></v-img>
      </router-link>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="user">
        <!-- Dashboard always available -->
        <v-btn class="mx-2" :to="user.role === 'admin' ? { name: 'adminDashboard' } : (user.role === 'coach' ? { name: 'coachDashboard' } : { name: 'athleteDashboard' })">
          Dashboard
        </v-btn>

        <!-- Athlete: show Today's Workout and Results -->
        <template v-if="user.role === 'athlete'">
          <v-btn class="mx-2" :to="{ name: 'workout' }"> Today's Workout </v-btn>
          <v-btn class="mx-2" :to="{ name: 'results' }"> Results </v-btn>
          <v-btn class="mx-2" :to="{ name: 'goals' }"> Goals </v-btn>
          <v-btn class="mx-2" :to="{ name: 'editUser', params: { id: user.userId } }"> Edit Profile </v-btn>
          <v-btn class="mx-2" :to="{ name: 'users' }"> Users </v-btn>
        </template>

        <!-- Coach: show management links with Athletes -->
        <template v-else-if="user.role === 'coach'">
          <v-btn class="mx-2" :to="{ name: 'athletes' }"> Athletes </v-btn>
          <v-btn class="mx-2" :to="{ name: 'exercises' }"> Exercises </v-btn>
          <v-btn class="mx-2" :to="{ name: 'exercisePlans' }"> Exercise Plans </v-btn>
          <v-btn class="mx-2" :to="{ name: 'goals' }"> Goals </v-btn>
        </template>

        <!-- Admin: show management links with All Users -->
        <template v-else-if="user.role === 'admin'">
          <v-btn class="mx-2" :to="{ name: 'users' }"> Users </v-btn>
          <v-btn class="mx-2" :to="{ name: 'exercises' }"> Exercises </v-btn>
          <v-btn class="mx-2" :to="{ name: 'exercisePlans' }"> Exercise Plans </v-btn>
          <v-btn class="mx-2" :to="{ name: 'goals' }"> Goals </v-btn>
        </template>
      </div>
      <v-menu bottom min-width="200px" rounded offset-y v-if="user">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon x-large>
            <v-avatar v-if="user" color="secondary">
              <span class="accent--text font-weight-bold">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="secondary" class="mt-2 mb-2">
                <span class="accent--text font-weight-bold">{{
                  initials
                }}</span>
              </v-avatar>
              <h3>{{ name }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <p class="text-caption" v-if="user.sport">
                Sport: {{ user.sport }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded variant="text" :to="{ name: 'settings' }" block class="mb-2">
                <v-icon left small>mdi-cog</v-icon>
                Settings
              </v-btn>
              <v-btn depressed rounded text @click="logout" block> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
