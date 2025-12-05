<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/userServices";
import Utils from "../config/utils";

const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);
const form = ref({ fName: "", lName: "", email: "", role: "athlete" });
const loading = ref(false);
const saving = ref(false);
const currentUser = ref(null);

// Check if current user is a coach
const isCoach = computed(() => currentUser.value?.role === 'coach');

// Check if editing an athlete
const isAthleteBeingEdited = computed(() => form.value?.role === 'athlete');

const fetch = async () => {
  loading.value = true;
  try {
    const resp = await UserServices.get(id);
    form.value = resp.data;
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;
  try {
    // If coach, only send the sport field
    const updateData = isCoach.value 
      ? { sport: form.value.sport }
      : form.value;
    
    await UserServices.update(id, updateData);
    
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
  fetch();
});
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>
        {{ isCoach ? 'Edit Athlete Sport' : 'Edit User' }}
      </v-toolbar-title>
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="my-4" />

    <!-- Coach View: Only Sport Field -->
    <v-card v-if="!loading && isCoach" class="mt-4">
      <v-card-text>
        <v-alert type="info" class="mb-4">
          As a coach, you can only update the sport for athletes.
        </v-alert>
        
        <v-text-field 
          v-model="form.fName" 
          label="First Name" 
          disabled 
          variant="outlined"
        />
        <v-text-field 
          v-model="form.lName" 
          label="Last Name" 
          disabled 
          variant="outlined"
        />
        <v-text-field 
          v-model="form.email" 
          label="Email" 
          disabled 
          variant="outlined"
        />
        
        <v-select
          v-if="isAthleteBeingEdited"
          v-model="form.sport"
          :items="['Baseball', 'Basketball', 'Football', 'Golf', 'Soccer', 'Swimming', 'Tennis', 'Track', 'Volleyball', 'Wrestling', 'Other']"
          label="Sport"
          clearable
          variant="outlined"
          color="green"
        />

        <v-btn type="submit" color="green" :loading="saving" class="mr-2" @click="save">
          Save Sport
        </v-btn>
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
      </v-card-text>
    </v-card>

    <!-- Admin View: All Fields Editable -->
    <v-form v-if="!loading && !isCoach" @submit.prevent="save">
      <v-text-field v-model="form.fName" label="First Name" required />
      <v-text-field v-model="form.lName" label="Last Name" required />
      <v-text-field v-model="form.email" label="Email" type="email" required />
      <v-select
        v-model="form.role"
        :items="['athlete', 'coach', 'admin']"
        label="Role"
        required
      />
      <v-select
        v-if="form.role === 'athlete'"
        v-model="form.sport"
        :items="['Baseball', 'Basketball', 'Football', 'Golf', 'Soccer', 'Swimming', 'Tennis', 'Track', 'Volleyball', 'Wrestling', 'Other']"
        label="Sport (Optional)"
        clearable
      />

      <v-btn type="submit" color="primary" :loading="saving" class="mr-2">
        Save
      </v-btn>
      <v-btn variant="text" @click="cancel">Cancel</v-btn>
    </v-form>
  </v-container>
</template>
