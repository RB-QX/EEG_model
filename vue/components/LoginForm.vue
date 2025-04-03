<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin">
        <button type="submit">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          Sign in with Google
        </button>
      </form>
      <p>
        Don't have an account?
        <a href="/signup">Sign up</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleLogin() {
      // Redirect to the login route
      window.location.href = "/login";
    },
  },
};
</script>

<style scoped>
/* Copy the CSS from login.css */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-box {
  background-color: #fff;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.login-box h1 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #444;
}

form button {
  background-color: #fff;
  border: 2px solid #ccc;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

form button:hover {
  background-color: #f0f0f0;
  border-color: #bbb;
}

form button img {
  height: 20px;
}

.login-box p {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #666;
}

.login-box a {
  color: #007bff;
  text-decoration: none;
}

.login-box a:hover {
  text-decoration: underline;
}
</style>