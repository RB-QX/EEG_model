import AdminDashboard from "./components/AdminDashboard.vue";
app.component("admin-dashboard", AdminDashboard);

<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>

    <!-- Users Section -->
    <section class="card">
      <h2>Registered Users</h2>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Predictions Section -->
    <section class="card">
      <h2>All Predictions</h2>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User Email</th>
            <th>Predicted Class</th>
            <th>Input Data</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prediction in predictions" :key="prediction.id">
            <td>{{ prediction.id }}</td>
            <td>{{ prediction.user_email }}</td>
            <td>{{ prediction.predicted_class }}</td>
            <td>{{ prediction.input_data }}</td>
            <td>{{ prediction.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard",
  props: {
    users: {
      type: Array,
      required: true,
    },
    predictions: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
  font-family: Arial, sans-serif;
  background-color: #f4f6f9;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #555;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.table th,
.table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.table th {
  background-color: #f9fafb;
  font-weight: bold;
  color: #555;
}

.table tr:hover {
  background-color: #f1f3f5;
}

.table tr:last-child td {
  border-bottom: none;
}
</style>