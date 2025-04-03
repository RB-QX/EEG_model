import { createApp } from "vue";
import LoginForm from "./components/LoginForm.vue";
import ProfileCard from "./components/ProfileCard.vue";
import router from "./router";

const app = createApp({});
app.component("login-form", LoginForm);
app.component("profile-card", ProfileCard);
app.use(router);
app.mount("#app");