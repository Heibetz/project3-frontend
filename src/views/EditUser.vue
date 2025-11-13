<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/userServices";

const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);
const form = ref({ fName: "", lName: "", email: "", role: "athlete" });
const loading = ref(false);
const saving = ref(false);

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
    await UserServices.update(id, form.value);
    router.push({ name: "users" });
  } catch (e) {
    console.log(e);
  } finally {
    saving.value = false;
  }
};

const cancel = () => router.push({ name: "users" });

onMounted(fetch);
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Edit User</v-toolbar-title>
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="my-4" />

    <v-form v-if="!loading" @submit.prevent="save">
      <v-text-field v-model="form.fName" label="First Name" required />
      <v-text-field v-model="form.lName" label="Last Name" required />
      <v-text-field v-model="form.email" label="Email" type="email" required />
      <v-select
        v-model="form.role"
        :items="['athlete', 'coach', 'admin']"
        label="Role"
        required
      />

      <v-btn type="submit" color="primary" :loading="saving" class="mr-2">
        Save
      </v-btn>
      <v-btn variant="text" @click="cancel">Cancel</v-btn>
    </v-form>
  </v-container>
</template>
