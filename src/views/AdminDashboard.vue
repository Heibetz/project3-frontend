<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils";
import UserServices from "../services/userServices";
import ExerciseServices from "../services/exerciseServices";
import ExercisePlanServices from "../services/exercisePlanServices";

const router = useRouter();
const user = ref(null);
const stats = ref({
  totalUsers: 0,
  totalExercises: 0,
  totalPlans: 0,
  athletes: 0,
  coaches: 0,
  admins: 0
});
const recentUsers = ref([]);
const loading = ref(true);

const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Fetch all data
    const [usersRes, exercisesRes, plansRes] = await Promise.all([
      UserServices.getAll(),
      ExerciseServices.getAll(),
      ExercisePlanServices.getAll()
    ]);

    const users = usersRes.data || [];
    stats.value.totalUsers = users.length;
    stats.value.totalExercises = exercisesRes.data?.length || 0;
    stats.value.totalPlans = plansRes.data?.length || 0;
    
    // Count by role
    stats.value.athletes = users.filter(u => u.role === 'athlete').length;
    stats.value.coaches = users.filter(u => u.role === 'coach').length;
    stats.value.admins = users.filter(u => u.role === 'admin').length;
    
    // Get 5 most recent users
    recentUsers.value = users.slice(-5).reverse();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  user.value = Utils.getStore("user");
  loadDashboardData();
});
</script>

<template>
  <v-container fluid>
    <v-toolbar color="primary" dark class="mb-4">
      <v-toolbar-title>Admin Dashboard</v-toolbar-title>
    </v-toolbar>

    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <h2>Welcome back, {{ user?.fName || '' }} {{ user?.lName || '' }}!</h2>
        <p class="text-subtitle-1 text-grey">Here's your system overview</p>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Statistics Cards -->
    <v-row v-if="!loading">
      <v-col cols="12" sm="6" md="4">
        <v-card color="blue" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalUsers }}</div>
            <div class="text-subtitle-1">Total Users</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card color="green" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalExercises }}</div>
            <div class="text-subtitle-1">Total Exercises</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card color="orange" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalPlans }}</div>
            <div class="text-subtitle-1">Exercise Plans</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- User Role Breakdown -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>User Breakdown by Role</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="blue">mdi-account-multiple</v-icon>
                </template>
                <v-list-item-title>Athletes</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="blue">{{ stats.athletes }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="green">mdi-whistle</v-icon>
                </template>
                <v-list-item-title>Coaches</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="green">{{ stats.coaches }}</v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="red">mdi-shield-account</v-icon>
                </template>
                <v-list-item-title>Admins</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="red">{{ stats.admins }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item @click="router.push({ name: 'addUser' })" class="cursor-pointer">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account-plus</v-icon>
                </template>
                <v-list-item-title>Add New User</v-list-item-title>
              </v-list-item>
              <v-list-item @click="router.push({ name: 'addExercise' })" class="cursor-pointer">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-dumbbell</v-icon>
                </template>
                <v-list-item-title>Add New Exercise</v-list-item-title>
              </v-list-item>
              <v-list-item @click="router.push({ name: 'addExercisePlan' })" class="cursor-pointer">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-clipboard-text</v-icon>
                </template>
                <v-list-item-title>Create Exercise Plan</v-list-item-title>
              </v-list-item>
              <v-list-item @click="router.push({ name: 'users' })" class="cursor-pointer">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Manage All Users</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Users Table -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Recent Users</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in recentUsers" :key="u.id">
                <td>{{ u.fName }} {{ u.lName }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <v-chip :color="u.role === 'admin' ? 'red' : (u.role === 'coach' ? 'green' : 'blue')" size="small">
                    {{ u.role }}
                  </v-chip>
                </td>
                <td>
                  <v-btn size="small" icon @click="router.push({ name: 'editUser', params: { id: u.id } })">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="router.push({ name: 'users' })">View All Users</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
