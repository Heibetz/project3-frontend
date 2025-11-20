<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import GoalServices from "../services/goalServices";

const router = useRouter();
const form = ref({ exerciseName: "", currentWeight: "", goalWeight: "" });
const saving = ref(false);

const save = async () => {
  saving.value = true;
  try {
    await GoalServices.create(form.value);
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
      <v-toolbar-title>Add Goal</v-toolbar-title>
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
