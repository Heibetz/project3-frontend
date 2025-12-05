<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import GoalServices from "../services/goalServices";
import UserServices from "../services/userServices";

const route = useRoute();
const router = useRouter();
const userId = Number(route.params.id);

const user = ref(null);
const goals = ref([]);
const loading = ref(false);
const error = ref("");

const fetchData = async () => {
	loading.value = true;
	error.value = "";
	try {
		// fetch user details
		const uResp = await UserServices.get(userId);
		user.value = uResp.data;

		// fetch all goals and filter by user_id
		const gResp = await GoalServices.getAll();
		goals.value = (gResp.data || []).filter(g => g.user_id === userId);
	} catch (e) {
		console.log(e);
		error.value = e?.response?.data?.message || e.message || "Failed to load goals";
	} finally {
		loading.value = false;
	}
};

onMounted(fetchData);

const backToAthletes = () => router.push({ name: "athletes" });
</script>

<template>
	<v-container>
		<v-toolbar color="blue" dark>
			<v-toolbar-title>
				<v-icon left>mdi-target</v-icon>
				{{ user ? `${user.fName} ${user.lName}` : 'Athlete' }} Goals
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn variant="outlined" color="white" @click="backToAthletes">
				<v-icon left>mdi-arrow-left</v-icon>
				Back to Athletes
			</v-btn>
		</v-toolbar>

		<v-progress-linear v-if="loading" indeterminate color="blue" class="my-4" />
		<v-alert v-if="error" type="error" class="my-2">{{ error }}</v-alert>

		<v-card v-if="!loading" class="mt-4" elevation="2">
			<v-card-text v-if="goals.length === 0" class="text-center py-8">
				<v-icon size="64" color="grey">mdi-target</v-icon>
				<p class="text-h6 mt-4 text-grey">No goals found for this athlete</p>
			</v-card-text>

			<v-table v-else>
				<thead>
					<tr>
						<th>ID</th>
						<th>Exercise ID</th>
						<th>Current Weight</th>
						<th>Goal Weight</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="goal in goals" :key="goal.id">
						<td>{{ goal.id }}</td>
						<td>{{ goal.exercise_id }}</td>
						<td>{{ goal.currentWeight ?? '-' }}</td>
						<td>{{ goal.goalWeight ?? '-' }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-card>
	</v-container>
 </template>

<style scoped>
</style>
