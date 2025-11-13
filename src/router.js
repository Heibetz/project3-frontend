import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";

import TutorialsList from "./views/TutorialsList.vue";
import EditTutorial from "./views/EditTutorial.vue";
import AddTutorial from "./views/AddTutorial.vue";
import ViewTutorial from "./views/ViewTutorial.vue";
import AddLesson from "./views/AddLesson.vue";
import EditLesson from "./views/EditLesson.vue";
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
      path: "/tutorials",
      name: "tutorials",
      component: TutorialsList,
    },
    {
      path: "/edit/:id",
      name: "edit",
      component: EditTutorial,
      props: true,
    },
    {
      path: "/add",
      name: "add",
      component: AddTutorial,
    },
    {
      path: "/view/:id",
      name: "view",
      component: ViewTutorial,
      props: true,
    },
    {
      path: "/addLesson/:tutorialId",
      name: "addLesson",
      component: AddLesson,
      props: true,
    },
    {
      path: "/editLesson/:tutorialId/:lessonId",
      name: "editLesson",
      component: EditLesson,
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
