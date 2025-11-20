<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/userServices";

const router = useRouter();
const users = ref([]);
const loading = ref(false);
const headers = [
  { text: "ID", value: "id" },
  { text: "First Name", value: "fName" },
  { text: "Last Name", value: "lName" },
  { text: "Email", value: "email" },
  { text: "Role", value: "role" },
  { text: "Sport", value: "sport" },
  { text: "Actions", value: "actions", sortable: false },
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    const resp = await UserServices.getAll();
    users.value = resp.data;
  } catch (e) {
    console.log(e);
  } finally {
    loading.value = false;
  }
};

const goAdd = () => router.push({ name: "addUser" });
const goEdit = (id) => router.push({ name: "editUser", params: { id } });
const remove = async (id) => {
  try {
    await UserServices.delete(id);
    await fetchUsers();
  } catch (e) {
    console.log(e);
  }
};

onMounted(fetchUsers);
</script>

<template>
  <v-container>
    <v-toolbar>
      <v-toolbar-title>Users</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="goAdd">Add User</v-btn>
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="my-4" />

    <v-table v-if="!loading">
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Sport</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.fName }}</td>
          <td>{{ u.lName }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.role === 'athlete' ? (u.sport?.toLowerCase() || "-") : "-" }}</td>
          <td>
            <v-btn size="small" class="mr-2" @click="goEdit(u.id)">Edit</v-btn>
            <v-btn size="small" color="error" @click="remove(u.id)">Delete</v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>
