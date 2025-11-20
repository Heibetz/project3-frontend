<script setup>
import GoalServices from "../services/goalServices";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";

const router = useRouter();
const goals = ref([]);
const user = Utils.getStore("user");
const message = ref("Add, Edit or Delete Goals");

const editGoal = (g) => {
  router.push({ name: "editGoal", params: { id: g.id } });
};

const addGoal = () => {
  router.push({ name: "addGoal" });
};

const deleteGoal = (g) => {
  GoalServices.delete(g.id)
    .then(() => {
      retrieveGoals();
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error deleting goal";
    });
};

const retrieveGoals = () => {
  GoalServices.getAll()
    .then((response) => {
      // API returns data in response.data
      goals.value = response.data;
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error loading goals";
    });
};

retrieveGoals();
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Goals</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="addGoal">Add Goal</v-btn>
      </v-toolbar>
      <br /><br />
      <v-card>
        <v-card-title> Goals </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Exercise</th>
              <th class="text-left">Current Weight</th>
              <th class="text-left">Goal Weight</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in goals" :key="item.id">
              <td>{{ item.exerciseName }}</td>
              <td>{{ item.currentWeight }}</td>
              <td>{{ item.goalWeight }}</td>
              <td>
                <v-icon small class="mx-4" @click="editGoal(item)">mdi-pencil</v-icon>
                <v-icon small class="mx-4" @click="deleteGoal(item)">mdi-trash-can</v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
</template>
