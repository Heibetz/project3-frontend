<script setup>
import ExercisePlanServices from "../services/exercisePlanServices";
import Utils from "../config/utils.js";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const exercisePlans = ref([]);
const user = Utils.getStore("user");
const message = ref("Search, Edit or Delete Exercise Plans");
const expandedPlans = ref(new Set());

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

const togglePlanExpansion = (planId) => {
  if (expandedPlans.value.has(planId)) {
    expandedPlans.value.delete(planId);
  } else {
    expandedPlans.value.add(planId);
  }
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
        
        <div v-if="exercisePlans.length === 0" class="pa-4">
          <v-alert type="info">
            No exercise plans found. Create your first exercise plan!
          </v-alert>
        </div>
        
        <div v-else>
          <v-card
            v-for="plan in exercisePlans"
            :key="plan.plan_id"
            class="mb-4 mx-4"
            elevation="2"
          >
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <h3>{{ plan.name }}</h3>
                <div class="text-caption text-grey">
                  {{ plan.description || "No description" }}
                  <v-chip
                    v-if="plan.day"
                    size="small"
                    color="secondary"
                    class="ml-2"
                  >
                    {{ plan.day }}
                  </v-chip>
                  <v-chip
                    v-if="plan.is_standard"
                    size="small"
                    color="primary"
                    class="ml-2"
                  >
                    Standard
                  </v-chip>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-btn
                  icon
                  size="small"
                  @click="togglePlanExpansion(plan.plan_id)"
                  class="mr-2"
                >
                  <v-icon>
                    {{
                      expandedPlans.has(plan.plan_id)
                        ? "mdi-chevron-up"
                        : "mdi-chevron-down"
                    }}
                  </v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  @click="editExercisePlan(plan)"
                  class="mr-2"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  @click="deleteExercisePlan(plan)"
                >
                  <v-icon>mdi-trash-can</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-expand-transition>
              <div v-show="expandedPlans.has(plan.plan_id)">
                <v-divider></v-divider>
                <v-card-text>
                  <h4 class="mb-3">Exercises in this plan:</h4>
                  
                  <div v-if="!plan.exercises || plan.exercises.length === 0">
                    <v-alert type="info" variant="tonal" class="mb-3">
                      No exercises in this plan yet. Edit the plan to add exercises.
                    </v-alert>
                  </div>
                  
                  <div v-else>
                    <div class="d-flex flex-column ga-2">
                      <v-card
                        v-for="(exercise, index) in plan.exercises"
                        :key="exercise.exercise_id || index"
                        variant="outlined"
                        class="mb-2"
                      >
                        <v-card-text>
                          <div class="d-flex justify-space-between align-center mb-2">
                            <h5>{{ exercise.name }}</h5>
                            <v-chip 
                              v-if="exercise.type" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            >
                              {{ exercise.type }}
                            </v-chip>
                          </div>
                          <div class="text-body-2">
                            <div class="d-flex flex-wrap ga-2 mb-2">
                              <v-chip 
                                v-if="exercise.exercisePlanExercise?.sets" 
                                size="small" 
                                variant="outlined"
                              >
                                Sets: {{ exercise.exercisePlanExercise.sets }}
                              </v-chip>
                              <v-chip 
                                v-if="exercise.exercisePlanExercise?.reps" 
                                size="small" 
                                variant="outlined"
                              >
                                Reps: {{ exercise.exercisePlanExercise.reps }}
                              </v-chip>
                              <v-chip 
                                size="small" 
                                variant="outlined"
                                color="warning"
                              >
                                Duration: {{ exercise.exercisePlanExercise?.duration || 'No time limit' }}
                              </v-chip>
                            </div>
                            <div v-if="exercise.description" class="text-caption text-grey">
                              {{ exercise.description }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>
                  </div>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped></style>
