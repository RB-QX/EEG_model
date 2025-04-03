import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "./components/LoginForm.vue";
import ProfileCard from "./components/ProfileCard.vue";
import AdminDashboard from "./components/AdminDashboard.vue";
import UserDashboard from "./components/UserDashboard.vue";

const routes = [
  { path: "/login", component: LoginForm },
  { path: "/profile", component: ProfileCard },
  { path: "/admin", component: AdminDashboard },
  { path: "/dashboard", component: UserDashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;