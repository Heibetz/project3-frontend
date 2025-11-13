import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import ExercisesList from "./views/ExercisesList.vue";
import AddExercise from "./views/AddExercise.vue";
import EditExercise from "./views/EditExercise.vue";
import ExercisePlansList from "./views/ExercisePlansList.vue";
import AddExercisePlan from "./views/AddExercisePlan.vue";
import EditExercisePlan from "./views/EditExercisePlan.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/exercises",
      name: "exercises",
      component: ExercisesList,
    },
    {
      path: "/exercises/add",
      name: "addExercise",
      component: AddExercise,
    },
    {
      path: "/exercises/edit/:id",
      name: "editExercise",
      component: EditExercise,
      props: true,
    },
    {
      path: "/exercise-plans",
      name: "exercisePlans",
      component: ExercisePlansList,
    },
    {
      path: "/exercise-plans/add",
      name: "addExercisePlan",
      component: AddExercisePlan,
    },
    {
      path: "/exercise-plans/edit/:id",
      name: "editExercisePlan",
      component: EditExercisePlan,
      props: true,
    },
  ],
});

export default router;
