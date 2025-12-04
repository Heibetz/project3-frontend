<script setup>
import { ref, onMounted, computed } from "vue";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";

const router = useRouter();
const user = Utils.getStore("user");
const message = ref("");
const messageType = ref("success");
const sport = ref(user.sport || null);
const selectedRole = ref(user.role || "athlete");


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

const roles = [
  { value: "athlete", label: "Athlete", icon: "mdi-run", color: "blue" },
  { value: "coach", label: "Coach", icon: "mdi-whistle", color: "green" },
  { value: "admin", label: "Admin", icon: "mdi-shield-account", color: "red" },
];

const currentRoleInfo = computed(() => {
  return roles.find(r => r.value === user?.role) || roles[0];
});

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

const switchRole = () => {
  if (selectedRole.value === user.role) {
    message.value = "You're already in this role!";
    messageType.value = "info";
    return;
  }

  user.role = selectedRole.value;
  Utils.setStore("user", user);
  
  message.value = `Role switched to ${selectedRole.value}! Redirecting...`;
  messageType.value = "success";

  const dashboardRoutes = {
    athlete: "athleteDashboard",
    coach: "coachDashboard",
    admin: "adminDashboard",
  };

  setTimeout(() => {
    router.push({ name: dashboardRoutes[selectedRole.value] });
    window.location.reload();
  }, 1500);
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
            <v-chip size="small" :color="roles.find(r => r.value === user.role)?.color || 'primary'" class="mt-2">{{ user.role }}</v-chip>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Role Switcher -->
          <h4 class="mb-3">
            <v-icon class="mr-1">mdi-swap-horizontal</v-icon>
            Switch Role
          </h4>
          <p class="text-caption mb-3">
            Quickly switch between roles for testing different features.
          </p>
          
          <v-select
            v-model="selectedRole"
            :items="roles"
            item-title="label"
            item-value="value"
            label="Select Role"
            variant="outlined"
            class="mb-3"
          >
            <template v-slot:prepend-inner>
              <v-icon :color="roles.find(r => r.value === selectedRole)?.color">
                {{ roles.find(r => r.value === selectedRole)?.icon }}
              </v-icon>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-btn 
            color="primary" 
            @click="switchRole" 
            block
            class="mb-4"
            :disabled="selectedRole === user.role"
          >
            <v-icon start>mdi-swap-horizontal</v-icon>
            Switch to {{ roles.find(r => r.value === selectedRole)?.label }}
          </v-btn>

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
              <v-btn variant="outlined" :to="{ name: 'exercises' }" block>
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
