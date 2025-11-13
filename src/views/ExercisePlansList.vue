<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import Utils from "../config/utils.js";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const exercisePlans = ref([]);
const user = Utils.getStore("user");
const message = ref("Search, Edit or Delete Exercise Plans");

const editExercisePlan = (plan) => {
  router.push({ name: "editExercisePlan", params: { id: plan.plan_id } });
};

const addExercisePlan = () => {
  router.push({ name: "addExercisePlan" });
};

const deleteExercisePlan = (plan) => {
  ExercisePlanServices.delete(plan.plan_id)
    .then(() => {
      retrieveExercisePlans();
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error deleting exercise plan";
    });
};

const retrieveExercisePlans = () => {
  ExercisePlanServices.getAll({ created_by: user.userId })
    .then((response) => {
      exercisePlans.value = response.data;
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error loading exercise plans";
    });
};

retrieveExercisePlans();
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Exercise Plans</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="addExercisePlan">Add Exercise Plan</v-btn>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title> Exercise Plans </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Standard</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in exercisePlans" :key="item.plan_id">
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td>{{ item.is_standard ? "Yes" : "No" }}</td>
              <td>
                <v-icon small class="mx-4" @click="editExercisePlan(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small class="mx-4" @click="deleteExercisePlan(item)">
                  mdi-trash-can
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped></style>
