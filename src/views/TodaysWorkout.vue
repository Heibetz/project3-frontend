<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import ResultServices from "../services/resultServices";
import Utils from "../config/utils.js";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const exercisePlans = ref([]);
const user = Utils.getStore("user");
const message = ref("Loading today's workout...");
const loading = ref(true);
const workoutStarted = ref(false);
const workoutResults = ref({});
const saving = ref(false);

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
  const params = {};
  
  // For athletes, show plans that:
  // 1. They created themselves, OR
  // 2. Are standard plans, OR  
  // 3. Match their sport (coach-assigned plans)
  // We'll filter by sport to get coach-assigned plans, and the backend will also return standard plans
  // We'll also need to include plans created by the athlete
  
  // Add sport filter to get coach-assigned plans matching athlete's sport
  if (user.sport) {
    params.sport = user.sport;
  }
  
  ExercisePlanServices.getAll(params)
    .then((response) => {
      // Filter to include: plans created by athlete OR standard plans OR plans matching their sport
      const allPlans = response.data || [];
      exercisePlans.value = allPlans.filter(plan => {
        // Include if: created by athlete, is standard, or matches their sport (already filtered by backend)
        return plan.created_by === user.userId || 
               plan.is_standard === true || 
               (user.sport && (plan.sport === user.sport || plan.sport === "All"));
      });
      
      console.log("All exercise plans:", exercisePlans.value);
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

const startWorkout = () => {
  workoutStarted.value = true;
  // Initialize workout results for each exercise
  allExercisesToday.value.forEach((exercise) => {
    workoutResults.value[exercise.exercise_id] = {
      resultMeasure1: exercise.exercisePlanExercise?.sets || null,
      resultMeasure2: exercise.exercisePlanExercise?.reps || null,
      resultMeasure3: exercise.exercisePlanExercise?.duration || null,
      notes: "",
    };
  });
};

const finishWorkout = async () => {
  saving.value = true;
  const today = new Date().toISOString().split("T")[0];
  
  try {
    const savePromises = allExercisesToday.value.map((exercise) => {
      const resultData = workoutResults.value[exercise.exercise_id];
      if (!resultData) return Promise.resolve();
      
      return ResultServices.create({
        user_id: user.userId,
        exercise_id: exercise.exercise_id,
        date: today,
        resultMeasure1: resultData.resultMeasure1 ? parseInt(resultData.resultMeasure1) : null,
        resultMeasure2: resultData.resultMeasure2 ? parseInt(resultData.resultMeasure2) : null,
        resultMeasure3: resultData.resultMeasure3 ? parseInt(resultData.resultMeasure3) : null,
        notes: resultData.notes || null,
      });
    });

    await Promise.all(savePromises);
    message.value = "Workout completed! Results saved successfully.";
    
    // Redirect to results page after a short delay
    setTimeout(() => {
      router.push({ name: "results" });
    }, 1500);
  } catch (e) {
    message.value = e.response?.data?.message || "Error saving workout results";
    saving.value = false;
  }
};

const cancelWorkout = () => {
  workoutStarted.value = false;
  workoutResults.value = {};
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

            <!-- Start Workout Button (shown when workout not started) -->
            <div v-if="!workoutStarted" class="mb-4">
              <v-card variant="tonal" color="success">
                <v-card-text class="text-center">
                  <h3>Ready to Start?</h3>
                  <div class="mt-2">
                    <strong>{{ allExercisesToday.length }} exercises</strong> scheduled for {{ today }}
                  </div>
                  <div class="mt-4">
                    <v-btn
                      color="primary"
                      size="large"
                      @click="startWorkout"
                    >
                      Start Workout
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>

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
                    <!-- Planned workout details (shown when workout not started) -->
                    <v-row v-if="!workoutStarted">
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="primary" class="text-center pa-3">
                          <div class="text-h4 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.sets || '-' }}
                          </div>
                          <div class="text-subtitle-2">SETS (Planned)</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="primary" class="text-center pa-3">
                          <div class="text-h4 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.reps || '-' }}
                          </div>
                          <div class="text-subtitle-2">REPS (Planned)</div>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card variant="tonal" color="info" class="text-center pa-3">
                          <div class="text-h6 font-weight-bold">
                            {{ exercise.exercisePlanExercise?.duration || 'Rest as needed' }}
                          </div>
                          <div class="text-subtitle-2">DURATION (Planned)</div>
                        </v-card>
                      </v-col>
                    </v-row>
                    
                    <!-- Result input fields (shown when workout started) -->
                    <v-row v-else>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="workoutResults[exercise.exercise_id].resultMeasure1"
                          type="number"
                          label="Sets"
                          variant="outlined"
                          :placeholder="exercise.exercisePlanExercise?.sets || ''"
                          hint="Enter sets completed"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="workoutResults[exercise.exercise_id].resultMeasure2"
                          type="number"
                          label="Reps"
                          variant="outlined"
                          :placeholder="exercise.exercisePlanExercise?.reps || ''"
                          hint="Enter reps completed"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="workoutResults[exercise.exercise_id].resultMeasure3"
                          type="number"
                          label="Measure 3 (Duration)"
                          variant="outlined"
                          :placeholder="exercise.exercisePlanExercise?.duration || ''"
                          hint="Enter duration in seconds"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="workoutResults[exercise.exercise_id].notes"
                          label="Notes (optional)"
                          variant="outlined"
                          rows="2"
                          :counter="500"
                        ></v-textarea>
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

            <!-- Finish Workout Actions (shown when workout started) -->
            <v-card v-if="workoutStarted" variant="tonal" color="warning" class="mt-4">
              <v-card-text class="text-center">
                <h3>Workout in Progress</h3>
                <div class="mt-2 text-body-2">
                  Enter your results above, then click Finish Workout when done.
                </div>
                <div class="mt-4 d-flex justify-center ga-2">
                  <v-btn
                    color="success"
                    size="large"
                    :loading="saving"
                    @click="finishWorkout"
                  >
                    Finish Workout
                  </v-btn>
                  <v-btn
                    color="error"
                    size="large"
                    variant="outlined"
                    @click="cancelWorkout"
                  >
                    Cancel
                  </v-btn>
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