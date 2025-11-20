<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import GoalServices from "../services/goalServices";

const router = useRouter();
const route = useRoute();
const form = ref({ exerciseName: "", currentWeight: "", goalWeight: "" });
const saving = ref(false);

const load = async () => {
  try {
    const res = await GoalServices.get(route.params.id);
    Object.assign(form.value, res.data);
  } catch (e) {
    console.error(e);
  }
};

onMounted(load);

const save = async () => {
  saving.value = true;
  try {
    await GoalServices.update(route.params.id, form.value);
    router.push({ name: "goals" });
  } catch (e) {
    console.log(e);
  } finally {
    saving.value = false;
  }
};

const cancel = () => router.push({ name: "goals" });
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Edit Goal</v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="save">
      <v-text-field v-model="form.exerciseName" label="Exercise Name" required />
      <v-text-field v-model="form.currentWeight" label="Current Weight" type="number" required />
      <v-text-field v-model="form.goalWeight" label="Goal Weight" type="number" required />

      <v-btn type="submit" color="primary" :loading="saving" class="mr-2">
        Save
      </v-btn>
      <v-btn variant="text" @click="cancel">Cancel</v-btn>
    </v-form>
  </v-container>
</template>
