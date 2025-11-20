<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import Utils from "../config/utils.js";
import { ref, onMounted, computed } from "vue";

const exercisePlans = ref([]);
const user = Utils.getStore("user");
const message = ref("Loading today's workout...");
const loading = ref(true);

const today = computed(() => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = new Date().getDay();
  return days[currentDay];
});

const todaysPlans = computed(() => {
  return exercisePlans.value.filter(plan => plan.day === today.value);
});

const allExercisesToday = computed(() => {
  const exercises = [];
  todaysPlans.value.forEach(plan => {
    if (plan.exercises && plan.exercises.length > 0) {
      plan.exercises.forEach(exercise => {
        // Keep the exercisePlanExercise object intact for proper data access
        exercises.push({
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          description: exercise.description,
          type: exercise.type,
          exercisePlanExercise: exercise.exercisePlanExercise, // Keep the nested object
          planName: plan.name,
          planDescription: plan.description,
          planSport: plan.sport
        });
      });
    }
  });
  return exercises;
});

const retrieveWorkoutPlans = () => {
  loading.value = true;
  const params = { 
    created_by: user.userId
  };
  
  // Add sport filter if user has a sport selected
  if (user.sport) {
    params.sport = user.sport;
  }
  
  ExercisePlanServices.getAll(params)
    .then((response) => {
      exercisePlans.value = response.data;
      console.log("All exercise plans:", response.data);
      console.log("Today is:", today.value);
      console.log("Today's plans:", todaysPlans.value);
      
      // Debug individual exercises
      todaysPlans.value.forEach(plan => {
        console.log(`Plan "${plan.name}" exercises:`, plan.exercises);
        if (plan.exercises) {
          plan.exercises.forEach(ex => {
            console.log(`Exercise "${ex.name}":`, {
              exercisePlanExercise: ex.exercisePlanExercise,
              sets: ex.exercisePlanExercise?.sets,
              reps: ex.exercisePlanExercise?.reps,
              duration: ex.exercisePlanExercise?.duration
            });
          });
        }
      });
      
      console.log("All exercises today:", allExercisesToday.value);
      
      if (todaysPlans.value.length === 0) {
        message.value = `No workouts scheduled for ${today.value}`;
      } else {
        message.value = `Your workout for ${today.value}`;
      }
      loading.value = false;
    })
    .catch((e) => {
      console.error("Error loading workout plans:", e);
      message.value = e.response?.data?.message || "Error loading workout plans";
      loading.value = false;
    });
};

onMounted(() => {
  retrieveWorkoutPlans();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>Today's Workout - {{ today }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" :to="{ name: 'exercisePlans' }">
          Manage Plans
        </v-btn>
      </v-toolbar>
      <br /><br />

      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar-today</v-icon>
          {{ message }}
        </v-card-title>

        <v-card-text>
          <div v-if="loading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <span class="ml-2">Loading your workout...</span>
          </div>

          <div v-else-if="allExercisesToday.length === 0">
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="d-flex flex-column">
                <strong>No workout scheduled for {{ today }}</strong>
                <span class="mt-2">Enjoy your rest day or create a new exercise plan!</span>
              </div>
            </v-alert>
            
            <div class="text-center">
              <v-btn color="primary" :to="{ name: 'addExercisePlan' }" class="mr-2">
                Create New Plan
              </v-btn>
              <v-btn variant="outlined" :to="{ name: 'exercisePlans' }">
                View All Plans
              </v-btn>
            </div>
          </div>

          <div v-else>
            <!-- Workout Plans Summary -->
            <div class="mb-4">
              <h3 class="mb-2">Today's Plans:</h3>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="plan in todaysPlans"
                  :key="plan.plan_id"
                  color="primary"
                  variant="outlined"
                >
                  {{ plan.name }}
                  <v-chip
                    v-if="plan.sport"
                    size="x-small"
                    color="info"
                    class="ml-1"
                  >
                    {{ plan.sport.toLowerCase() }}
                  </v-chip>
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-4"></v-divider>

            <!-- Exercise List -->
            <h3 class="mb-3">Exercises ({{ allExercisesToday.length }} total)</h3>
            
            <div class="d-flex flex-column ga-3">
              <v-card
                v-for="(exercise, index) in allExercisesToday"
                :key="`${exercise.exercise_id}-${index}`"
                variant="outlined"
                class="exercise-card"
              >
                <v-card-text>
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div>
                      <h4 class="text-h5 mb-1">{{ exercise.name }}</h4>
                      <div class="text-caption text-grey">
                        From: {{ exercise.planName }}
                        <v-chip
                          v-if="exercise.planSport"
                          size="x-small"
                          color="secondary"
                          variant="outlined"
                          class="ml-2"
                        >
                          {{ exercise.planSport.toLowerCase() }}
                        </v-chip>
                        <v-chip
                          v-if="exercise.type"
                          size="x-small"
                          color="info"
                          variant="outlined"
                          class="ml-2"
                        >
                          {{ exercise.type }}
                        </v-chip>
                      </div>
                    </div>
                    <v-chip color="success" size="small">
                      Exercise {{ index + 1 }}
                    </v-chip>
                  </div>

                  <div class="workout-details">
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="primary" class="text-center pa-3">
                          <div class="text-h4 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.sets || '-' }}
                          </div>
                          <div class="text-subtitle-2">SETS</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="primary" class="text-center pa-3">
                          <div class="text-h4 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.reps || '-' }}
                          </div>
                          <div class="text-subtitle-2">REPS</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="info" class="text-center pa-3">
                          <div class="text-h6 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.duration || 'Rest as needed' }}
                          </div>
                          <div class="text-subtitle-2">DURATION</div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>

                  <div v-if="exercise.description" class="mt-3">
                    <v-divider class="mb-2"></v-divider>
                    <div class="text-body-2 text-grey-darken-1">
                      <strong>Notes:</strong> {{ exercise.description }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Workout Summary -->
            <v-card variant="tonal" color="success" class="mt-4">
              <v-card-text class="text-center">
                <h3>Workout Summary</h3>
                <div class="mt-2">
                  <strong>{{ allExercisesToday.length }} exercises</strong> scheduled for {{ today }}
                </div>
                <div class="mt-2 text-body-2">
                  Stay consistent and crush your goals! 💪
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.exercise-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.workout-details {
  margin: 16px 0;
}
</style>