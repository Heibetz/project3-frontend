<script setup>
import { ref, onMounted } from "vue";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const user = Utils.getStore("user");
const message = ref("");
const messageType = ref("success");
const sport = ref(user.sport || null);
const originalSport = ref(user.sport || null); // Store original value

const sports = [
  "baseball",
  "basketball",
  "football",
  "golf",
  "soccer",
  "swimming",
  "tennis",
  "track",
  "volleyball",
  "wrestling",
  "other"
];

const saveSport = () => {
  // Update user in store
  user.sport = sport.value;
  Utils.setStore("user", user);
  
  message.value = "Sport preference saved! Your workout plans will now be filtered by your sport.";
  messageType.value = "success";
  
  // Redirect to today's workout after a delay
  setTimeout(() => {
    router.push({ name: "workout" });
  }, 2000);
};

const cancel = () => {
  // Reset to original value (discard changes)
  sport.value = originalSport.value;
  
  // Show cancellation message
  message.value = "Changes cancelled. Settings have been reset.";
  messageType.value = "info";
};

onMounted(() => {
  if (!user) {
    router.push({ name: "login" });
  }
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>User Settings</v-toolbar-title>
      </v-toolbar>
      <br /><br />

      <v-card max-width="600" class="mx-auto">
        <v-card-title>
          <v-icon class="mr-2">mdi-account-cog</v-icon>
          Profile Settings
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <h3 class="mb-2">{{ user.fName }} {{ user.lName }}</h3>
            <p class="text-caption">{{ user.email }}</p>
            <v-chip size="small" color="primary" class="mt-2">{{ user.role }}</v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <h4 class="mb-3">Sport Preference</h4>
          <p class="text-caption mb-4">
            Select your sport to see workout plans tailored for you. Plans marked as "All" will be shown regardless of your sport selection.
          </p>

          <v-select
            v-model="sport"
            :items="sports"
            label="Select Your Sport"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-trophy"
            class="mb-4"
          ></v-select>

          <v-alert v-if="message" :type="messageType" class="mb-4">
            {{ message }}
          </v-alert>

          <v-row>
            <v-col>
              <v-btn color="primary" @click="saveSport" block>
                Save Settings
              </v-btn>
            </v-col>
            <v-col>
              <v-btn variant="outlined" @click="cancel" block>
                Cancel Changes
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
