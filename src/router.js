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
import AthleteDashboard from "./views/AthleteDashboard.vue";
import CoachDashboard from "./views/CoachDashboard.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import Utils from "./config/utils.js";
import EditProfile from "./views/EditProfile.vue";

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
      path: "/dashboard/athlete",
      name: "athleteDashboard",
      component: AthleteDashboard,
      meta: { roles: ["athlete", "coach", "admin"] },
    },
    {
      path: "/dashboard/coach",
      name: "coachDashboard",
      component: CoachDashboard,
      meta: { roles: ["coach", "admin"] },
    },
    {
      path: "/dashboard/admin",
      name: "adminDashboard",
      component: AdminDashboard,
      meta: { roles: ["admin"] },
    },
    {
      path: "/users",
      name: "users",
      component: UsersList,
      meta: { roles: ["admin", "coach", "athlete"] },
    },
    {
      path: "/users/add",
      name: "addUser",
      component: AddUser,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/users/edit/:id",
      name: "editUser",
      component: EditUser,
      props: true,
      meta: { roles: ["admin", "athlete", "coach"] },
    },
    {
      path: "/exercises",
      name: "exercises",
      component: ExercisesList,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/exercises/add",
      name: "addExercise",
      component: AddExercise,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/exercises/edit/:id",
      name: "editExercise",
      component: EditExercise,
      props: true,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/workout",
      name: "workout",
      component: TodaysWorkout,
      meta: { roles: ["athlete"] },
    },
    {
      path: "/profile/edit",
      name: "editProfile",
      component: EditProfile,
      meta: { roles: ["athlete"] },
    },
    {
      path: "/exercise-plans",
      name: "exercisePlans",
      component: ExercisePlansList,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/exercise-plans/add",
      name: "addExercisePlan",
      component: AddExercisePlan,
      meta: { roles: ["admin", "coach"] },
    },
    {
      path: "/exercise-plans/edit/:id",
      name: "editExercisePlan",
      component: EditExercisePlan,
      props: true,
      meta: { roles: ["admin", "coach"] },
    },
  ],
});

function roleToRoute(role) {
  if (role === "admin") return { name: "adminDashboard" };
  if (role === "coach") return { name: "coachDashboard" };
  return { name: "athleteDashboard" };
}

router.beforeEach((to, from, next) => {
  const user = Utils.getStore("user");
  if (!user && to.name !== "login") {
    return next({ name: "login" });
  }
  if (user && (to.name === "login" || to.path === "/")) {
    return next(roleToRoute(user.role));
  }
  if (to.meta && to.meta.roles) {
    if (!user) return next({ name: "login" });
    if (!to.meta.roles.includes(user.role)) {
      return next(roleToRoute(user.role));
    }
  }
  next();
});

export default router;
