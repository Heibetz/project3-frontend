<script setup>
import ResultServices from "../services/resultServices";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils.js";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const results = ref([]);
const exercises = ref([]);
const user = Utils.getStore("user");
const message = ref("View and filter your training results");
const loading = ref(false);

// Filter state
const selectedExercise = ref(null);
const dateFilter = ref("all"); // "all", "week", "month", "year"

// Fetch all exercises for the filter dropdown
const fetchExercises = () => {
  ExerciseServices.getAll({ created_by: user.userId })
    .then((response) => {
      exercises.value = response.data;
    })
    .catch((e) => {
      console.error("Error loading exercises:", e);
    });
};

// Fetch results with filters
const retrieveResults = () => {
  loading.value = true;
  const params = { user_id: user.userId };
  
  if (selectedExercise.value) {
    params.exercise_id = selectedExercise.value;
  }

  ResultServices.getAll(params)
    .then((response) => {
      results.value = response.data;
      loading.value = false;
    })
    .catch((e) => {
      message.value = e.response?.data?.message || "Error loading results";
      loading.value = false;
    });
};

// Computed property for filtered results
const filteredResults = computed(() => {
  let filtered = [...results.value];

  // Apply date filter
  if (dateFilter.value !== "all") {
    const now = new Date();
    let cutoffDate = new Date();

    switch (dateFilter.value) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    filtered = filtered.filter((result) => {
      if (!result.date) return false;
      const resultDate = new Date(result.date);
      return resultDate >= cutoffDate;
    });
  }

  return filtered;
});

// Statistics computed properties
const stats = computed(() => {
  const allResults = filteredResults.value;
  
  // Get unique workout dates
  const uniqueDates = new Set();
  allResults.forEach(r => {
    if (r.date) {
      const dateStr = new Date(r.date).toDateString();
      uniqueDates.add(dateStr);
    }
  });

  // Calculate max values across all measures
  let maxMeasure1 = null;
  let maxMeasure2 = null;
  let maxMeasure3 = null;
  
  allResults.forEach(r => {
    if (r.resultMeasure1 !== null && r.resultMeasure1 !== undefined) {
      if (maxMeasure1 === null || r.resultMeasure1 > maxMeasure1) {
        maxMeasure1 = r.resultMeasure1;
      }
    }
    if (r.resultMeasure2 !== null && r.resultMeasure2 !== undefined) {
      if (maxMeasure2 === null || r.resultMeasure2 > maxMeasure2) {
        maxMeasure2 = r.resultMeasure2;
      }
    }
    if (r.resultMeasure3 !== null && r.resultMeasure3 !== undefined) {
      if (maxMeasure3 === null || r.resultMeasure3 > maxMeasure3) {
        maxMeasure3 = r.resultMeasure3;
      }
    }
  });

  // Get recent workouts (last 5 unique dates)
  const sortedDates = Array.from(uniqueDates).sort((a, b) => {
    return new Date(b) - new Date(a);
  });
  const recentWorkoutDates = sortedDates.slice(0, 5);

  return {
    totalWorkouts: uniqueDates.size,
    totalResults: allResults.length,
    maxMeasure1,
    maxMeasure2,
    maxMeasure3,
    recentWorkoutDates,
  };
});

// Get results for a specific date
const getResultsForDate = (dateString) => {
  return filteredResults.value.filter(r => {
    if (!r.date) return false;
    return new Date(r.date).toDateString() === dateString;
  });
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Handle filter changes
const onExerciseFilterChange = () => {
  retrieveResults();
};

const onDateFilterChange = () => {
  // Date filter is applied via computed property, no need to refetch
};

// Clear filters
const clearFilters = () => {
  selectedExercise.value = null;
  dateFilter.value = "all";
  retrieveResults();
};

// Edit result
const editResult = (result) => {
  router.push({ name: "editResult", params: { id: result.id } });
};

onMounted(() => {
  fetchExercises();
  retrieveResults();
});
</script>

<template>
  <div>
    <v-container>
      <v-toolbar>
        <v-toolbar-title>My Results</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>

      <!-- Statistics Cards -->
      <v-row class="mt-4">
        <v-col cols="12" md="3">
          <v-card variant="tonal" color="primary">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold">{{ stats.totalWorkouts }}</div>
              <div class="text-subtitle-2 mt-1">Total Workouts</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="tonal" color="secondary">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold">{{ stats.totalResults }}</div>
              <div class="text-subtitle-2 mt-1">Total Results</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="tonal" color="success">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold">
                {{ stats.maxMeasure1 !== null ? stats.maxMeasure1 : '-' }}
              </div>
              <div class="text-subtitle-2 mt-1">Max Sets</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card variant="tonal" color="warning">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold">
                {{ stats.maxMeasure2 !== null ? stats.maxMeasure2 : '-' }}
              </div>
              <div class="text-subtitle-2 mt-1">Max Reps</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Workouts -->
      <v-card class="mt-4" v-if="stats.recentWorkoutDates.length > 0">
        <v-card-title>Recent Workouts</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="(dateStr, index) in stats.recentWorkoutDates"
              :key="index"
              :title="formatDate(new Date(dateStr).toISOString())"
              :subtitle="`${getResultsForDate(dateStr).length} exercise(s)`"
            >
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <v-card class="mt-4">
        <v-card-title>Filter Results</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedExercise"
                :items="exercises"
                item-title="name"
                item-value="exercise_id"
                label="Filter by Exercise"
                clearable
                @update:model-value="onExerciseFilterChange"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="dateFilter"
                :items="[
                  { title: 'All Time', value: 'all' },
                  { title: 'Last Week', value: 'week' },
                  { title: 'Last Month', value: 'month' },
                  { title: 'Last Year', value: 'year' },
                ]"
                label="Filter by Date"
                @update:model-value="onDateFilterChange"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <v-btn
                color="secondary"
                variant="outlined"
                @click="clearFilters"
              >
                Clear Filters
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="my-4" />

      <v-card class="mt-4">
        <v-card-title>
          Results ({{ filteredResults.length }})
        </v-card-title>
        <v-card-text>
          <b>{{ message }}</b>
        </v-card-text>
        <v-table v-if="!loading">
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th class="text-left">Exercise</th>
              <th class="text-left">Sets</th>
              <th class="text-left">Reps</th>
              <th class="text-left">Additional Metric</th>
              <th class="text-left">Notes</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredResults.length === 0">
              <td colspan="7" class="text-center pa-4">
                <v-alert type="info" variant="tonal">
                  No results found. Try adjusting your filters or add some results!
                </v-alert>
              </td>
            </tr>
            <tr v-for="result in filteredResults" :key="result.id">
              <td>{{ formatDate(result.date) }}</td>
              <td>
                {{ exercises.find(e => e.exercise_id === result.exercise_id)?.name || `Exercise ${result.exercise_id}` }}
              </td>
              <td>{{ result.resultMeasure1 ?? "-" }}</td>
              <td>{{ result.resultMeasure2 ?? "-" }}</td>
              <td>{{ result.resultMeasure3 ?? "-" }}</td>
              <td>{{ result.notes || "-" }}</td>
              <td>
                <v-icon small class="mx-2" @click="editResult(result)" title="Edit Result">
                  mdi-pencil
                </v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
</template>

