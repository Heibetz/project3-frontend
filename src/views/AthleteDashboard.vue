<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils";
import ExercisePlanServices from "../services/exercisePlanServices";

const router = useRouter();
const user = ref(null);
const exercisePlans = ref([]);
const loading = ref(true);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const today = computed(() => {
  return days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
});

const todaysWorkout = computed(() => {
  return exercisePlans.value.filter(p => p.day === today.value);
});

const plansByDay = computed(() => {
  return days.reduce((acc, day) => {
    acc[day] = exercisePlans.value.filter(p => p.day === day);
    return acc;
  }, {});
});

const stats = computed(() => ({
  totalPlans: exercisePlans.value.length,
  todayWorkouts: todaysWorkout.value.length,
  weeklyWorkouts: exercisePlans.value.filter(p => p.day).length
}));

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const params = {};
    // Add sport filter to get coach-assigned plans matching athlete's sport
    if (user.value.sport) {
      params.sport = user.value.sport;
    }
    
    const plansRes = await ExercisePlanServices.getAll(params);
    // Filter to include: plans created by athlete OR standard plans OR plans matching their sport
    const allPlans = plansRes.data || [];
    exercisePlans.value = allPlans.filter(plan => {
      // Include if: created by athlete, is standard, or matches their sport
      return plan.created_by === user.value.userId || 
             plan.is_standard === true || 
             (user.value.sport && (plan.sport === user.value.sport || plan.sport === "All"));
    });
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
    <v-toolbar color="blue" dark class="mb-4">
      <v-toolbar-title>Athlete Dashboard</v-toolbar-title>
    </v-toolbar>

    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <h2>Welcome, {{ user?.fName || '' }} {{ user?.lName || '' }}!</h2>
        <p class="text-subtitle-1 text-grey">Today is {{ today }} - Let's crush your workout!</p>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="blue" class="mb-4" />

    <!-- Statistics Cards -->
    <v-row v-if="!loading">
      <v-col cols="12" sm="4">
        <v-card color="blue" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.todayWorkouts }}</div>
            <div class="text-subtitle-1">Today's Workouts</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="green" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.weeklyWorkouts }}</div>
            <div class="text-subtitle-1">Weekly Workouts</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card color="orange" dark elevation="4">
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ stats.totalPlans }}</div>
            <div class="text-subtitle-1">Total Plans</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Today's Workout -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="4" color="blue-lighten-5">
          <v-card-title class="text-h5">
            <v-icon color="blue" left size="large">mdi-calendar-today</v-icon>
            Today's Workout - {{ today }}
          </v-card-title>
          <v-card-text>
            <div v-if="todaysWorkout.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-emoticon-sad-outline</v-icon>
              <p class="text-h6 mt-4 text-grey">No workout scheduled for today</p>
              <p class="text-subtitle-1">Take a rest day or view all plans!</p>
              <v-btn color="blue" class="mt-4" @click="router.push({ name: 'exercisePlans' })">
                Browse Exercise Plans
              </v-btn>
            </div>
            <v-list v-else>
              <v-list-item
                v-for="plan in todaysWorkout"
                :key="plan.plan_id"
                @click="router.push({ name: 'workout' })"
                class="cursor-pointer mb-2"
                rounded
                elevation="2"
              >
                <template v-slot:prepend>
                  <v-icon color="blue" size="large">mdi-dumbbell</v-icon>
                </template>
                <v-list-item-title class="text-h6">{{ plan.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="plan.description">{{ plan.description }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn color="blue" variant="outlined">
                    Start Workout
                    <v-icon right>mdi-arrow-right</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Weekly Schedule -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Your Weekly Training Schedule</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="day in days" :key="day" cols="12" md="6" lg="4">
                <v-card 
                  :color="day === today ? 'blue-lighten-4' : (plansByDay[day]?.length > 0 ? 'green-lighten-5' : 'grey-lighten-4')" 
                  elevation="1"
                  :class="day === today ? 'border-blue' : ''"
                >
                  <v-card-title class="text-h6">
                    <v-icon 
                      :color="day === today ? 'blue' : (plansByDay[day]?.length > 0 ? 'green' : 'grey')" 
                      left
                    >
                      {{ day === today ? 'mdi-calendar-star' : 'mdi-calendar' }}
                    </v-icon>
                    {{ day }}
                    <v-chip v-if="day === today" color="blue" size="small" class="ml-2">Today</v-chip>
                  </v-card-title>
                  <v-card-text>
                    <div v-if="plansByDay[day]?.length === 0" class="text-grey">
                      Rest day
                    </div>
                    <v-list v-else dense>
                      <v-list-item
                        v-for="plan in plansByDay[day]"
                        :key="plan.plan_id"
                        @click="router.push({ name: 'workout' })"
                        class="cursor-pointer"
                      >
                        <template v-slot:prepend>
                          <v-icon :color="day === today ? 'blue' : 'green'" size="small">mdi-check-circle</v-icon>
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
  </v-container>  
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.border-blue {
  border: 2px solid #2196F3 !important;
}
</style>
