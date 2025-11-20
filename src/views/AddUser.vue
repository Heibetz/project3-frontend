<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/userServices";

const router = useRouter();
const form = ref({ fName: "", lName: "", email: "", role: "athlete", sport: null });
const saving = ref(false);

const save = async () => {
  saving.value = true;
  try {
    await UserServices.create(form.value);
    router.push({ name: "users" });
  } catch (e) {
    console.log(e);
  } finally {
    saving.value = false;
  }
};

const cancel = () => router.push({ name: "users" });
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Add User</v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="save">
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
        :items="['baseball', 'basketball', 'football', 'golf', 'soccer', 'swimming', 'tennis', 'track', 'volleyball', 'wrestling', 'other']"
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
