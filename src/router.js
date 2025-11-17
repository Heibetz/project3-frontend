import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import ExercisesList from "./views/ExercisesList.vue";
import AddExercise from "./views/AddExercise.vue";
import EditExercise from "./views/EditExercise.vue";
import ExercisePlansList from "./views/ExercisePlansList.vue";
import AddExercisePlan from "./views/AddExercisePlan.vue";
import EditExercisePlan from "./views/EditExercisePlan.vue";
import TodaysWorkout from "./views/TodaysWorkout.vue";
import UsersList from "./views/UsersList.vue";
import AddUser from "./views/AddUser.vue";
import EditUser from "./views/EditUser.vue";
import ResultsList from "./views/ResultsList.vue";
import EditResult from "./views/EditResult.vue";

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
      path: "/users",
      name: "users",
      component: UsersList,
    },
    {
      path: "/users/add",
      name: "addUser",
      component: AddUser,
    },
    {
      path: "/users/edit/:id",
      name: "editUser",
      component: EditUser,
      props: true,
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
      path: "/workout",
      name: "workout",
      component: TodaysWorkout,
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
    {
      path: "/results",
      name: "results",
      component: ResultsList,
    },
    {
      path: "/results/edit/:id",
      name: "editResult",
      component: EditResult,
      props: true,
    },
  ],
});

export default router;
