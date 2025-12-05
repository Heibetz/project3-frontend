<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/userServices";

const router = useRouter();
const athletes = ref([]);
const loading = ref(false);

const fetchAthletes = async () => {
  loading.value = true;
  try {
    const resp = await UserServices.getAll();
    // Filter to show only athletes
    athletes.value = (resp.data || []).filter(u => u.role === 'athlete');
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};

const goAdd = () => router.push({ name: "addUser" });
const goEdit = (id) => router.push({ name: "editUser", params: { id } });
const viewResults = (id) => router.push({ name: "athleteResults", params: { id } });
const viewGoals = (id) => router.push({ name: "athleteGoals", params: { id } });
const remove = async (id) => {
  if (confirm("Are you sure you want to delete this athlete?")) {
    try {
      await UserServices.delete(id);
      await fetchAthletes();
    } catch (e) {
      console.log(e);
    }
  }
};

onMounted(fetchAthletes);
</script>

<template>
  <v-container>
    <v-toolbar color="green" dark>
      <v-toolbar-title>
        <v-icon left>mdi-account-multiple</v-icon>
        Athletes
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="white" variant="outlined" @click="goAdd">
        <v-icon left>mdi-plus</v-icon>
        Add Athlete
      </v-btn>
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate color="green" class="my-4" />

    <v-card v-if="!loading" class="mt-4" elevation="2">
      <v-card-text v-if="athletes.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey">mdi-account-off</v-icon>
        <p class="text-h6 mt-4 text-grey">No athletes found</p>
        <v-btn color="green" class="mt-4" @click="goAdd">Add Your First Athlete</v-btn>
      </v-card-text>

      <v-table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="athlete in athletes" :key="athlete.id">
            <td>{{ athlete.id }}</td>
            <td>{{ athlete.fName }}</td>
            <td>{{ athlete.lName }}</td>
            <td>{{ athlete.email }}</td>
            <td>
              <v-btn 
                size="small" 
                color="primary" 
                class="mr-2" 
                @click="goEdit(athlete.id)"
              >
                <v-icon left size="small">mdi-pencil</v-icon>
                Edit
              </v-btn>
              <v-btn 
                size="small" 
                color="success" 
                class="mr-2" 
                @click="viewResults(athlete.id)"
              >
                <v-icon left size="small">mdi-chart-line</v-icon>
                View Results
              </v-btn>
              <v-btn 
                size="small" 
                color="info" 
                class="mr-2" 
                @click="viewGoals(athlete.id)"
              >
                <v-icon left size="small">mdi-target</v-icon>
                View Goals
              </v-btn>
              <v-btn 
                size="small" 
                color="error" 
                @click="remove(athlete.id)"
              >
                <v-icon left size="small">mdi-delete</v-icon>
                Delete
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-card-text class="text-center text-grey">
        <v-chip color="blue" class="ma-2">
          <v-icon left size="small">mdi-account</v-icon>
          {{ athletes.length }} Total Athletes
        </v-chip>
      </v-card-text>
    </v-card>
  </v-container>
</template>
