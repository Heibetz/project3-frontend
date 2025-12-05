<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/userServices";
import Utils from "../config/utils";

const router = useRouter();
const form = ref({ fName: "", lName: "", email: "", role: "athlete", sport: null });
const saving = ref(false);
const currentUser = ref(null);

// Check if current user is a coach
const isCoach = computed(() => currentUser.value?.role === 'coach');

// Available roles based on user type
const availableRoles = computed(() => {
  if (isCoach.value) {
    return ['athlete']; // Coaches can only add athletes
  }
  return ['athlete', 'coach', 'admin']; // Admins can add anyone
});

const save = async () => {
  saving.value = true;
  try {
    await UserServices.create(form.value);
    // Redirect based on user role
    if (isCoach.value) {
      router.push({ name: "athletes" });
    } else {
      router.push({ name: "users" });
    }
  } catch (e) {
    console.log(e);
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  // Coaches go back to athletes list, admins go to users list
  if (isCoach.value) {
    router.push({ name: "athletes" });
  } else {
    router.push({ name: "users" });
  }
};

onMounted(() => {
  currentUser.value = Utils.getStore("user");
  // Ensure coaches can only create athletes
  if (isCoach.value) {
    form.value.role = 'athlete';
  }
});
</script>

<template>
  <v-container>
    <v-toolbar :color="isCoach ? 'green' : 'primary'">
      <v-toolbar-title>
        {{ isCoach ? 'Add Athlete' : 'Add User' }}
      </v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="save">
      <v-alert v-if="isCoach" type="info" class="my-4">
        As a coach, you can only add athletes to the system.
      </v-alert>

      <v-text-field v-model="form.fName" label="First Name" required />
      <v-text-field v-model="form.lName" label="Last Name" required />
      <v-text-field v-model="form.email" label="Email" type="email" required />
      <v-select
        v-model="form.role"
        :items="availableRoles"
        label="Role"
        required
        :disabled="isCoach"
      />
      <v-select
        v-if="form.role === 'athlete'"
        v-model="form.sport"
        :items="['Baseball', 'Basketball', 'Football', 'Golf', 'Soccer', 'Swimming', 'Tennis', 'Track', 'Volleyball', 'Wrestling', 'Other']"
        label="Sport (Optional)"
        clearable
      />

      <v-btn type="submit" :color="isCoach ? 'green' : 'primary'" :loading="saving" class="mr-2">
        Save
      </v-btn>
      <v-btn variant="text" @click="cancel">Cancel</v-btn>
    </v-form>
  </v-container>
</template>
