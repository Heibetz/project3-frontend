<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils";
import UserServices from "../services/userServices";

const router = useRouter();
const user = ref(Utils.getStore("user"));
const form = ref({ fName: "", lName: "", email: "" });
const loading = ref(false);
const saving = ref(false);

const fetch = async () => {
  if (!user.value) return;
  loading.value = true;
  try {
    const resp = await UserServices.get(user.value.userId);
    form.value = { fName: resp.data.fName, lName: resp.data.lName, email: resp.data.email };
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!user.value) return;
  saving.value = true;
  try {
    await UserServices.update(user.value.userId, form.value);
    const updated = { ...user.value, fName: form.value.fName, lName: form.value.lName, email: form.value.email };
    Utils.setStore("user", updated);
    router.push({ name: "athleteDashboard" });
  } catch (e) {
    console.log(e);
  } finally {
    saving.value = false;
  }
};

onMounted(fetch);
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Edit Profile</v-toolbar-title>
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="my-4" />

    <v-form v-if="!loading" @submit.prevent="save">
      <v-text-field v-model="form.fName" label="First Name" required />
      <v-text-field v-model="form.lName" label="Last Name" required />
      <v-text-field v-model="form.email" label="Email" type="email" required />

      <v-btn type="submit" color="primary" :loading="saving" class="mr-2">Save</v-btn>
      <v-btn variant="text" @click="router.push({ name: 'athleteDashboard' })">Cancel</v-btn>
    </v-form>
  </v-container>
</template>
