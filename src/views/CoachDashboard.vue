<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils";
import ExercisePlanServices from "../services/exercisePlanServices";
import UserServices from "../services/userServices";

const router = useRouter();
const user = ref(null);
const exercisePlans = ref([]);
const athletes = ref([]);
const loading = ref(true);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const stats = computed(() => ({
  totalPlans: exercisePlans.value.length,
  totalAthletes: athletes.value.length,
  plansThisWeek: exercisePlans.value.filter(p => p.day).length
}));

const plansByDay = computed(() => {
  return days.reduce((acc, day) => {
    acc[day] = exercisePlans.value.filter(p => p.day === day);
    return acc;
  }, {});
});

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const [plansRes, usersRes] = await Promise.all([
      ExercisePlanServices.getAll(),
      UserServices.getAll()
    ]);

    exercisePlans.value = plansRes.data || [];
    athletes.value = (usersRes.data || []).filter(u => u.role === 'athlete');
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
    <v-toolbar color="green" dark class="mb-4">
      <v-toolbar-title>Coach Dashboard</v-toolbar-title>
    </v-toolbar>

    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <h2>Welcome, Coach {{ user?.fName || '' }} {{ user?.lName || '' }}!</h2>
        <p class="text-subtitle-1 text-grey">Manage your training programs and athletes</p>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="green" class="mb-4" />

    <!-- Statistics Cards -->
    <v-row v-if="!loading">
      <v-col cols="12" sm="4">
        <v-card color="green" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalPlans }}</div>
            <div class="text-subtitle-1">Total Exercise Plans</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="blue" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalAthletes }}</div>
            <div class="text-subtitle-1">Total Athletes</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="orange" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.plansThisWeek }}</div>
            <div class="text-subtitle-1">Weekly Plans</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="primary" size="large" @click="router.push({ name: 'addExercisePlan' })">
                  <v-icon left>mdi-plus</v-icon>
                  New Plan
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="green" size="large" @click="router.push({ name: 'exercisePlans' })">
                  <v-icon left>mdi-clipboard-text-multiple</v-icon>
                  All Plans
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="blue" size="large" @click="router.push({ name: 'exercises' })">
                  <v-icon left>mdi-dumbbell</v-icon>
                  Exercises
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn block color="orange" size="large" @click="router.push({ name: 'athletes' })">
                  <v-icon left>mdi-account-group</v-icon>
                  Athletes
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Weekly Schedule -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Weekly Training Schedule</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="day in days" :key="day" cols="12" md="6" lg="4">
                <v-card :color="plansByDay[day]?.length > 0 ? 'green-lighten-5' : 'grey-lighten-4'" elevation="1">
                  <v-card-title class="text-h6">
                    <v-icon :color="plansByDay[day]?.length > 0 ? 'green' : 'grey'" left>mdi-calendar</v-icon>
                    {{ day }}
                  </v-card-title>
                  <v-card-text>
                    <div v-if="plansByDay[day]?.length === 0" class="text-grey">
                      No plans scheduled
                    </div>
                    <v-list v-else dense>
                      <v-list-item
                        v-for="plan in plansByDay[day]"
                        :key="plan.plan_id"
                        @click="router.push({ name: 'editExercisePlan', params: { id: plan.plan_id } })"
                        class="cursor-pointer"
                      >
                        <template v-slot:prepend>
                          <v-icon color="green" size="small">mdi-clipboard-check</v-icon>
                        </template>
                        <v-list-item-title>{{ plan.name }}</v-list-item-title>
                        <v-list-item-subtitle v-if="plan.description">{{ plan.description }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Athletes -->
    <v-row v-if="!loading && athletes.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Your Athletes</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="athlete in athletes.slice(0, 5)" :key="athlete.id">
                <td>{{ athlete.fName }} {{ athlete.lName }}</td>
                <td>{{ athlete.email }}</td>
                <td>
                  <v-btn size="small" icon @click="router.push({ name: 'editUser', params: { id: athlete.id } })">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-card-actions v-if="athletes.length > 5">
            <v-spacer />
            <v-btn color="primary" @click="router.push({ name: 'athletes' })">View All Athletes</v-btn>
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
